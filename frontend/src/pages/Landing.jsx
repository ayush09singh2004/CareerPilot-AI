import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Briefcase, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  {
    question: 'Is CareerPilot AI free to use?',
    answer:
      'Yes! CareerPilot AI offers a free tier that includes resume building, basic analysis, and limited job matching. Premium features are available for advanced users.',
  },
  {
    question: 'How does the AI resume analysis work?',
    answer:
      'Our AI analyzes your resume against industry standards, ATS requirements, and job descriptions to provide actionable feedback and improvement suggestions.',
  },
  {
    question: 'Can I upload my existing resume?',
    answer:
      'Absolutely. You can upload your current resume in PDF or DOCX format, and we will parse it, analyze it, and help you improve it.',
  },
  {
    question: 'What file formats are supported?',
    answer:
      'We support PDF and DOCX for resume uploads. For generated resumes, you can download them as PDF.',
  },
  {
    question: 'How accurate is the job matching?',
    answer:
      'Our AI considers your skills, experience, education, and preferences to match you with relevant roles. Match accuracy improves as you update your profile.',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    content:
      'CareerPilot AI helped me identify gaps in my resume that I never noticed. The AI analysis was spot-on and helped me land my dream job.',
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Manager at Stripe',
    content:
      'The resume builder is incredibly intuitive. I went from a mediocre resume to multiple interview callbacks within a week.',
  },
  {
    name: 'Priya Patel',
    role: 'Data Scientist at Meta',
    content:
      'The skill gap analysis showed me exactly what I needed to learn. Within 3 months, I had the skills to qualify for senior roles.',
  },
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-borderMain rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-textMain">{question}</span>
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 text-gray-600">{answer}</div>
      )}
    </div>
  );
};

const Landing = () => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="pt-24 pb-32 px-6 flex-1 flex flex-col items-center text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8">
          The future of career growth
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-textMain mb-6 max-w-4xl">
          Build Your <span className="text-primary">Resume.</span>{' '}
          <br className="hidden md:block" />
          Discover Your <span className="text-primary">Career.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Create professional resumes, analyze them with AI, and match with the
          perfect job roles. Your career journey starts here.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/signup"
            className="px-8 py-4 rounded-full bg-primary text-white font-semibold hover:bg-blue-700 transition-all shadow-soft flex items-center justify-center space-x-2"
          >
            <span>Start Building for Free</span>
            <ArrowRight size={20} />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-full bg-white border border-borderMain text-textMain font-semibold hover:bg-gray-50 transition-all flex items-center justify-center"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondaryBg px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-textMain mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Powerful tools designed to accelerate your career progression.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-soft">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Professional Resume Builder</h3>
              <p className="text-gray-500">
                Create ATS-friendly resumes in minutes with our intuitive
                drag-and-drop builder.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-soft">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-success mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Resume Analysis</h3>
              <p className="text-gray-500">
                Get instant feedback on your resume with our advanced AI scoring
                system.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-soft">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-warning mb-6">
                <Briefcase size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Job Matching</h3>
              <p className="text-gray-500">
                Discover job opportunities tailored specifically to your skills
                and experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-textMain mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6">
              <div className="text-5xl font-extrabold text-gray-100 mb-4">01</div>
              <h3 className="text-xl font-bold mb-2">Create Profile</h3>
              <p className="text-gray-500">Sign up and enter your details.</p>
            </div>
            <div className="p-6">
              <div className="text-5xl font-extrabold text-gray-100 mb-4">02</div>
              <h3 className="text-xl font-bold mb-2">Build Resume</h3>
              <p className="text-gray-500">Use our templates to stand out.</p>
            </div>
            <div className="p-6">
              <div className="text-5xl font-extrabold text-gray-100 mb-4">03</div>
              <h3 className="text-xl font-bold mb-2">Get Matches</h3>
              <p className="text-gray-500">Find the perfect job for you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-secondaryBg">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-textMain mb-6">
                Built for the modern job seeker
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                CareerPilot AI was created with a simple mission: make career
                growth accessible to everyone. We combine the power of artificial
                intelligence with intuitive design to help you put your best
                foot forward.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Whether you are a recent graduate entering the workforce or an
                experienced professional looking for your next opportunity,
                CareerPilot AI provides the tools and insights you need to
                succeed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft text-center">
                <p className="text-4xl font-bold text-primary mb-2">50K+</p>
                <p className="text-gray-500 text-sm">Resumes Created</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft text-center">
                <p className="text-4xl font-bold text-primary mb-2">10K+</p>
                <p className="text-gray-500 text-sm">Job Matches</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft text-center">
                <p className="text-4xl font-bold text-primary mb-2">95%</p>
                <p className="text-gray-500 text-sm">User Satisfaction</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft text-center">
                <p className="text-4xl font-bold text-primary mb-2">200+</p>
                <p className="text-gray-500 text-sm">Partner Companies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-textMain mb-4">
              Loved by job seekers
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              See what our users have to say about their experience with
              CareerPilot AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-secondaryBg p-8 rounded-2xl border border-borderMain"
              >
                <p className="text-gray-600 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-textMain">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-secondaryBg">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-textMain mb-4">
              Frequently asked questions
            </h2>
            <p className="text-gray-500">
              Everything you need to know about CareerPilot AI.
            </p>
          </div>
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-textMain mb-6">
            Ready to take the next step?
          </h2>
          <p className="text-gray-500 mb-10 text-lg">
            Join thousands of job seekers who are building smarter careers with
            CareerPilot AI.
          </p>
          <Link
            to="/signup"
            className="px-8 py-4 rounded-full bg-primary text-white font-semibold hover:bg-blue-700 transition-all shadow-soft inline-flex items-center space-x-2"
          >
            <span>Get Started for Free</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
