const Organization = require('../models/Organization');
const ApiError = require('../utils/ApiError');
const auditLogRepository = require('../repositories/AuditLogRepository');

class OrganizationSettingsService {
  /**
   * Update profile and settings preferences
   */
  async updateSettings(sessionOrOrgId, settingsPayload, updatedByUserId) {
    const orgId = typeof sessionOrOrgId === 'object' && sessionOrOrgId._id ? sessionOrOrgId._id : sessionOrOrgId;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw new ApiError(404, 'Organization not found');
    }

    const {
      name,
      website,
      email,
      phone,
      industry,
      employeeCount,
      language,
      timezone,
      currency,
      branding,
      procurementDefaults,
    } = settingsPayload;

    if (name) organization.name = name;
    if (website) organization.website = website;
    if (email) organization.email = email;
    if (phone) organization.phone = phone;
    if (industry) organization.industry = industry;
    if (employeeCount) organization.employeeCount = employeeCount;
    if (language) organization.language = language;
    if (timezone) organization.timezone = timezone;
    if (currency) organization.currency = currency;

    if (branding) {
      organization.settings = organization.settings || {};
      organization.settings.branding = {
        ...organization.settings.branding,
        ...branding
      };
    }

    if (procurementDefaults) {
      organization.settings = organization.settings || {};
      organization.settings.procurementDefaults = {
        ...organization.settings.procurementDefaults,
        ...procurementDefaults
      };
    }

    await organization.save();

    await auditLogRepository.create(orgId, {
      user: updatedByUserId,
      action: 'SETTINGS_UPDATED',
      entityType: 'Organization',
      entityId: organization._id,
      newValue: { updatedFields: Object.keys(settingsPayload) }
    });

    return organization;
  }
}

module.exports = new OrganizationSettingsService();
