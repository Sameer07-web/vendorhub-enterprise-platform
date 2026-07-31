const Organization = require('../models/Organization');

class OrganizationService {
  /**
   * Create a new organization
   */
  async createOrganization(data) {
    // Generate a simple slug if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const org = new Organization({ ...data, slug });
    await org.save();

    // Automatically seed default roles
    const dynamicRoleService = require('./dynamicRole.service');
    await dynamicRoleService.seedDefaultRoles(org._id, data.owner);

    return org;
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id) {
    const org = await Organization.findById(id).lean();
    if (!org) {
      throw new Error('Organization not found');
    }
    return org;
  }

  /**
   * Update organization details
   */
  async updateOrganization(id, updateData) {
    const org = await Organization.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!org) {
      throw new Error('Organization not found');
    }
    return org;
  }

  /**
   * Soft delete organization
   */
  async deleteOrganization(id) {
    const org = await Organization.findByIdAndUpdate(id, { status: 'ARCHIVED' }, { new: true });
    if (!org) {
      throw new Error('Organization not found');
    }
    return org;
  }

  /**
   * Get organization settings
   */
  async getSettings(id) {
    const org = await Organization.findById(id).select('settings').lean();
    if (!org) {
      throw new Error('Organization not found');
    }
    return org.settings;
  }

  /**
   * Update organization settings
   */
  async updateSettings(id, settingsUpdate) {
    // We only update the settings sub-document explicitly
    const update = {};
    for (const [key, value] of Object.entries(settingsUpdate)) {
      update[`settings.${key}`] = value;
    }
    const org = await Organization.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!org) {
      throw new Error('Organization not found');
    }
    return org.settings;
  }
}

module.exports = new OrganizationService();
