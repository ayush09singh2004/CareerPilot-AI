require('dotenv').config();
var http = require('http');

function request(method, path, body, token) {
  return new Promise(function(resolve) {
    var data = body ? JSON.stringify(body) : '';
    var headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    var opts = { hostname: 'localhost', port: 5000, path: path, method: method, headers: headers };
    var req = http.request(opts, function(res) {
      var d = ''; res.on('data', function(c) { d += c; }); res.on('end', function() { resolve({ status: res.statusCode, body: JSON.parse(d) }); });
    });
    if (data) req.write(data);
    req.end();
  });
}

(async function() {
  // Step 1: Login (try the user's email from the DB scan)
  var login = await request('POST', '/api/auth/login', { email: 'testuser@careerpilot.com', password: 'Test@1234' });
  var token = login.body.token;
  console.log('Login status:', login.status, '| user:', login.body.email || login.body.message);
  if (!token) { console.log('No token - login failed'); process.exit(1); }

  // Step 2: Fetch resumes
  var resumes = await request('GET', '/api/resume', null, token);
  console.log('Resumes found:', resumes.body.length || 0);
  if (!resumes.body.length) { console.log('No resumes found for this account.'); process.exit(0); }

  var resume = resumes.body[0];
  console.log('\nTarget resume    :', resume.title);
  console.log('ID               :', resume._id);
  console.log('extractedText    :', resume.extractedText ? resume.extractedText.length + ' chars' : 'NONE');
  console.log('skills           :', resume.skills ? resume.skills.length : 0);
  console.log('experience       :', resume.experience ? resume.experience.length : 0);
  console.log('education        :', resume.education ? resume.education.length : 0);

  // Step 3: Run analysis
  console.log('\nCalling /api/analysis/' + resume._id + ' ...');
  var r = await request('POST', '/api/analysis/' + resume._id, {}, token);
  var a = r.body;

  console.log('\n=== HTTP', r.status, '===');
  if (a.message) {
    console.log('ERROR  :', a.message);
    console.log('DETAIL :', a.error || '');
  } else {
    console.log('resumeScore  :', a.resumeScore);
    console.log('atsScore     :', a.atsScore);
    console.log('summary      :', a.summary ? a.summary.substring(0,100) + '...' : 'MISSING');
    console.log('strengths    :', a.strengths ? a.strengths.length + ' items → ' + (a.strengths[0] || '') : 'MISSING');
    console.log('weaknesses   :', a.weaknesses ? a.weaknesses.length + ' items' : 'MISSING');
    console.log('missingSkills:', a.missingSkills ? a.missingSkills.slice(0,4).join(', ') : 'MISSING');
    console.log('jobs         :', a.recommendedJobs ? a.recommendedJobs.map(function(j){return j.role+'('+j.matchPercentage+'%)';}).join(', ') : 'MISSING');
    console.log('roadmap      :', a.learningRoadmap ? a.learningRoadmap.length + ' steps → ' + (a.learningRoadmap[0] && a.learningRoadmap[0].topic) : 'MISSING');
    console.log('skillGap     :', a.skillGap ? a.skillGap.substring(0,120) + '...' : 'MISSING');
    console.log('\n--- FEATURE CHECKLIST ---');
    console.log('ATS Score        :', a.atsScore != null ? 'PASS' : 'FAIL');
    console.log('Resume Score     :', a.resumeScore != null ? 'PASS' : 'FAIL');
    console.log('Strengths        :', a.strengths && a.strengths.length ? 'PASS' : 'FAIL');
    console.log('Weaknesses       :', a.weaknesses && a.weaknesses.length ? 'PASS' : 'FAIL');
    console.log('Missing Skills   :', a.missingSkills && a.missingSkills.length ? 'PASS' : 'FAIL');
    console.log('Skill Gap        :', a.skillGap ? 'PASS' : 'FAIL');
    console.log('Job Matching     :', a.recommendedJobs && a.recommendedJobs.length ? 'PASS' : 'FAIL');
    console.log('Learning Roadmap :', a.learningRoadmap && a.learningRoadmap.length ? 'PASS' : 'FAIL');
    console.log('Improvement Tips :', a.improvementSuggestions && a.improvementSuggestions.length ? 'PASS' : 'FAIL');
  }
  process.exit(0);
})();
