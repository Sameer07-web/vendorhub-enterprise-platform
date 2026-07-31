const Organization = require('../models/Organization');

exports.tenantMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.organization) {
      return res.status(401).json({ success: false, error: 'User is not associated with an organization' });
    }

    // Attempt to load the organization. In a high-traffic setup, this could be cached in Redis.
    const organization = await Organization.findById(req.user.organization).lean();

    if (!organization) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    if (organization.status !== 'ACTIVE' && organization.status !== 'TRIAL') {
      return res.status(403).json({ success: false, error: `Organization is ${organization.status.toLowerCase()}. Please contact support.` });
    }

    // As requested, expose a rich req.tenant object
    req.tenant = {
      _id: organization._id,
      name: organization.name,
      slug: organization.slug,
      plan: organization.plan,
      status: organization.status,
      settings: organization.settings,
      featureFlags: organization.featureFlags
    };
    
    // For convenience in queries:
    req.organization = { _id: organization._id };
    
    next();
  } catch (error) {
    console.error('Tenant Middleware Error:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve tenant context' });
  }
};
