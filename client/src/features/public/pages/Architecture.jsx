import React from 'react';
import { Database, Server, Layout, Shield } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../../components/common/Card';

const Architecture = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-surface-900 tracking-tight">System Architecture</h1>
        <p className="mt-4 text-xl text-surface-600 max-w-3xl mx-auto">
          VendorHub is built on a scalable MERN stack, optimized for high-density enterprise data and zero-latency interactions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="space-y-6">
          <Card>
            <CardHeader 
              title="Frontend Layer (React + Vite)" 
              description="A highly responsive Single Page Application."
              action={<Layout className="text-primary-600" />}
            />
            <CardBody>
              <ul className="list-disc pl-5 space-y-2 text-surface-700">
                <li><strong>State Management:</strong> React Context API for global state.</li>
                <li><strong>Styling:</strong> Tailwind CSS with a strict, semantic design system. Zero heavy UI frameworks.</li>
                <li><strong>Performance:</strong> Optimized renders, memoized components, and 150ms standardized transitions.</li>
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader 
              title="Backend Layer (Node.js + Express)" 
              description="RESTful API architecture."
              action={<Server className="text-success-600" />}
            />
            <CardBody>
              <ul className="list-disc pl-5 space-y-2 text-surface-700">
                <li><strong>Architecture:</strong> MVC pattern with clear separation of concerns (Controllers, Services, Models).</li>
                <li><strong>Validation:</strong> Strict payload validation and error boundary handling.</li>
                <li><strong>Authentication:</strong> Stateless JWT strategy via HTTP-only secure cookies (in production) or Bearer tokens.</li>
              </ul>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader 
              title="Database Layer (MongoDB)" 
              description="Flexible, scalable NoSQL data store."
              action={<Database className="text-warning-600" />}
            />
            <CardBody>
              <ul className="list-disc pl-5 space-y-2 text-surface-700">
                <li><strong>Schema Design:</strong> Mongoose ODM with strict schemas, indexing on highly-queried fields (e.g., status, vendorCode).</li>
                <li><strong>Referential Integrity:</strong> Virtual populates and manual snapshotting for immutable historical records (like Purchase Requests in RFQs).</li>
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader 
              title="Security & Compliance" 
              description="Enterprise-grade protection."
              action={<Shield className="text-error-600" />}
            />
            <CardBody>
              <ul className="list-disc pl-5 space-y-2 text-surface-700">
                <li><strong>RBAC:</strong> Role-based access control middleware protecting all routes based on user roles (Admin, Manager, User).</li>
                <li><strong>Data Protection:</strong> Bcrypt password hashing, rate limiting, and CORS configuration.</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Architecture;
