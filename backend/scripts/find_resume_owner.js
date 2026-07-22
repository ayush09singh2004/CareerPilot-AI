require('dotenv').config();
var mongoose = require('mongoose');
var dns = require('dns');
dns.setServers(['8.8.8.8']);

mongoose.connect(process.env.MONGODB_URI).then(async function() {
  var Resume = require('../models/Resume');
  var User = require('../models/User');

  var resumes = await Resume.find({}).sort({ updatedAt: -1 });
  console.log('Total resumes:', resumes.length);

  for (var r of resumes) {
    var user = await User.findById(r.user).select('email fullName');
    console.log('\nResume:', r.title);
    console.log('  ID           :', r._id.toString());
    console.log('  Owner email  :', user ? user.email : 'UNKNOWN');
    console.log('  Owner name   :', user ? user.fullName : 'UNKNOWN');
    console.log('  extractedText:', r.extractedText ? r.extractedText.length + ' chars' : 'NONE');
    console.log('  skills       :', r.skills && r.skills.length ? r.skills.join(', ').substring(0,60) : '(empty)');
    console.log('  experience   :', r.experience ? r.experience.length : 0, 'items');
    console.log('  education    :', r.education ? r.education.length : 0, 'items');
  }

  await mongoose.disconnect();
  process.exit(0);
});
