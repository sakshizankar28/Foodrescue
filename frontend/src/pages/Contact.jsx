// Contact.jsx - Contact information and inquiry form page
import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate brief network submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
    }, 400);
  };

  return (
    <div className="page-body">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '1rem auto 3rem' }}>
          <div className="section-eyebrow">📬 Reach Out To Us</div>
          <h1 className="section-title">Contact FoodRescue</h1>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            Have questions about partnering with your college canteen, hotel, or NGO? We're here to help you get started.
          </p>
        </div>

        <div className="grid-2" style={{ alignItems: 'start', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Left: Contact Info Cards */}
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-body">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--g-800)' }}>
                  📍 Headquarters & Support Desk
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--g-100)', color: 'var(--g-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      🏢
                    </div>
                    <div>
                      <strong>Campus Coordinator Office:</strong>
                      <div style={{ color: 'var(--n-600)', marginTop: '2px' }}>
                        Innovation Center, Tech Park Road, Electronic City, Bengaluru, Karnataka 560100
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--g-100)', color: 'var(--g-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      📧
                    </div>
                    <div>
                      <strong>Email Inquiries:</strong>
                      <div style={{ color: 'var(--n-600)', marginTop: '2px' }}>
                        <a href="mailto:support@foodrescue.org" style={{ color: 'var(--g-600)', fontWeight: 600 }}>
                          support@foodrescue.org
                        </a>
                      </div>
                      <div style={{ color: 'var(--n-500)', fontSize: '0.82rem' }}>Typically responds in &lt; 4 hours</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--g-100)', color: 'var(--g-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      📞
                    </div>
                    <div>
                      <strong>Direct Coordinator Helpline:</strong>
                      <div style={{ color: 'var(--n-600)', marginTop: '2px' }}>
                        <a href="tel:+919876543210" style={{ color: 'var(--g-600)', fontWeight: 600 }}>
                          +91 98765 43210
                        </a>
                      </div>
                      <div style={{ color: 'var(--n-500)', fontSize: '0.82rem' }}>Mon – Sun: 8:00 AM – 10:00 PM IST</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--c-50)', border: '1px solid var(--c-200)' }}>
              <div className="card-body">
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--c-900)' }}>
                  🚨 Urgent Same-Day Food Pickup?
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--c-700)', lineHeight: 1.6 }}>
                  If you have a large banquet or wedding surplus that needs collection within 2 hours, please post directly on the platform or call our emergency volunteer line immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>Send Us a Message</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--n-500)', marginBottom: '1.5rem' }}>
                Fill out the quick form below and our team will get back to you promptly.
              </p>

              {submitted && (
                <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                  🎉 <strong>Thank you!</strong> Your message has been sent successfully. Our team will get in touch with you shortly.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label className="form-label" htmlFor="contact-name">Your Full Name *</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Priya Nair"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row" style={{ marginBottom: '1.2rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-email">Email Address *</label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      className="form-control"
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-phone">Phone Number</label>
                    <input
                      type="tel"
                      id="contact-phone"
                      name="phone"
                      className="form-control"
                      placeholder="+91 98765 00000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label className="form-label" htmlFor="contact-subject">Inquiry Type</label>
                  <select
                    id="contact-subject"
                    name="subject"
                    className="form-control"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Hostel / Canteen Partnership">College / Hostel / Canteen Partnership</option>
                    <option value="NGO Onboarding">NGO / Foundation Onboarding</option>
                    <option value="Volunteer Coordination">Student Volunteer Coordination</option>
                    <option value="Feedback & Support">Feedback & Support</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" htmlFor="contact-message">Your Message *</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className="form-control"
                    rows={4}
                    placeholder="Tell us about your organization or inquiry..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                  {loading ? '⏳ Sending Message…' : '✉️ Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
