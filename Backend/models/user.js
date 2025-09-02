const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = crypto.createHash('sha256').update(process.env.CRYPTO_SECRET).digest();


const NoteSchema = new mongoose.Schema({
  id: String,
  title: {type: String, required: true, },
  content: {type: String, required: true, },
  created: {type: String, required: true, },
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/,
    maxlength: 100,
  },
  password: {
    type: String,
    required: true,
  },
  notes: [NoteSchema],
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'dark',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// Hash the password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Encrypt Notes Content 
UserSchema.pre('save', function(next) {
  if (!this.isModified('notes')) return next();
  for (let note of this.notes) {
    if (note.content) {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      const encrypted = Buffer.concat([cipher.update(note.content), cipher.final()]);
      note.content = iv.toString('hex') + ':' + encrypted.toString('hex');
    }
  }
  next();
});

UserSchema.methods.getDecryptedNotes = function() {
  const decryptedNotes = [];
  for (let note of this.notes) {
    let decryptedContent = '';
    if (note.content) {
      const [ivHex, encryptedHex] = note.content.split(':');
      if (ivHex && encryptedHex) {
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        decryptedContent = decrypted.toString('utf8');
      } else {
        decryptedContent = note.content; 
      }
    }
    decryptedNotes.push({
      id: note.id,
      title: note.title,
      content: decryptedContent,
      created: note.created,
    });
  }
  return decryptedNotes;
}

// Method to compare password
UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate verification token
UserSchema.methods.generateVerificationToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Generate password reset token
UserSchema.methods.generateResetPasswordToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return token;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;