import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, KeyRound, Smartphone, ArrowRight, Check } from 'lucide-react';

const features = [
  { icon: Lock, title: 'AES-256 Encryption', desc: 'Military-grade encryption protects every password in your vault.' },
  { icon: Smartphone, title: 'Dual 2FA', desc: 'Google Authenticator and WhatsApp OTP for maximum security.' },
  { icon: KeyRound, title: 'Password Generator', desc: 'Create strong, unique passwords with customizable options.' },
  { icon: Shield, title: 'Breach Detection', desc: 'Check passwords against known data breaches instantly.' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-dark-950">
      <nav className="glass border-b border-dark-700/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-vault-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">SecureVault</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-secondary text-sm">Login</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      <section className="relative px-6 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-vault-600/10 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your passwords,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vault-400 to-vault-600">
              secured forever
            </span>
          </h1>
          <p className="text-dark-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            SecureVault is a production-ready password manager with real encryption,
            dual 2FA authentication, and breach detection.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3">Sign In</Link>
          </div>
        </motion.div>
      </section>

      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Enterprise-grade security</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card text-center"
            >
              <div className="w-12 h-12 bg-vault-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-vault-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-dark-400 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-6">Why SecureVault?</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {['Real MongoDB database', 'JWT + Refresh token auth', 'WhatsApp & Authenticator 2FA', 'HaveIBeenPwned integration', 'Login history tracking', 'Deployed on Render & Vercel'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-dark-300">
                <Check className="w-5 h-5 text-vault-400 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-8 text-dark-500 text-sm border-t border-dark-800">
        &copy; {new Date().getFullYear()} SecureVault. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
