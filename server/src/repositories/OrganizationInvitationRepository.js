const BaseRepository = require('./BaseRepository');
const OrganizationInvitation = require('../models/OrganizationInvitation');

class OrganizationInvitationRepository extends BaseRepository {
  constructor() {
    super(OrganizationInvitation);
  }
}

module.exports = new OrganizationInvitationRepository();
