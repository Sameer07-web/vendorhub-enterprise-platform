import React from 'react';
import { BookOpen, MessageSquare, Keyboard, FileText, ExternalLink } from 'lucide-react';
import Button from '../../../components/common/Button';

const Help = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-surface-900">How can we help?</h1>
        <p className="text-surface-500 mt-2">Search our knowledge base or get in touch with support.</p>
        
        <div className="mt-6 max-w-xl mx-auto relative">
          <input 
            type="text" 
            placeholder="Search for articles, guides, or FAQs..." 
            className="w-full pl-4 pr-12 py-3 rounded-lg border border-border bg-surface shadow-sm focus-ring text-surface-900"
          />
          <Button variant="primary" className="absolute right-1.5 top-1.5 bottom-1.5 px-3 py-1">
            Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <a href="#" className="card-base p-6 hover:border-primary-500 hover:shadow-floating transition-all group">
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="text-primary-600 w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2 flex items-center justify-between">
            Documentation <ExternalLink size={16} className="text-surface-400 group-hover:text-primary-500" />
          </h3>
          <p className="text-surface-500 text-sm leading-relaxed">
            Comprehensive guides on setting up VendorHub, integrating ERPs, and configuring approval workflows.
          </p>
        </a>

        <div className="card-base p-6 hover:border-primary-500 transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Keyboard className="text-primary-600 w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2">Keyboard Shortcuts</h3>
          <p className="text-surface-500 text-sm leading-relaxed mb-4">
            Navigate the platform at lightning speed without taking your hands off the keyboard.
          </p>
          <div className="flex gap-2">
            <kbd className="px-2 py-1 bg-surface-100 border border-border rounded text-xs font-mono text-surface-700">Ctrl+K</kbd>
            <span className="text-xs text-surface-500 self-center">Search</span>
          </div>
        </div>

        <a href="#" className="card-base p-6 hover:border-primary-500 hover:shadow-floating transition-all group">
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="text-primary-600 w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2 flex items-center justify-between">
            API Reference <ExternalLink size={16} className="text-surface-400 group-hover:text-primary-500" />
          </h3>
          <p className="text-surface-500 text-sm leading-relaxed">
            Detailed endpoints, authentication methods, and webhooks for developers.
          </p>
        </a>

        <div className="card-base p-6 hover:border-primary-500 transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="text-primary-600 w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2">Contact Support</h3>
          <p className="text-surface-500 text-sm leading-relaxed mb-4">
            Enterprise customers get 24/7 priority support with a 1-hour SLA.
          </p>
          <Button variant="outline" className="w-full justify-center">Open Support Ticket</Button>
        </div>
      </div>
      
      <div className="mt-12 text-center text-sm text-surface-400">
        VendorHub Enterprise Platform v2.4.0 • Built for Scale
      </div>
    </div>
  );
};

export default Help;
