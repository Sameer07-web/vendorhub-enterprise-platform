const BaseRepository = require('./BaseRepository');
const OrganizationMemberRole = require('../models/OrganizationMemberRole');

class OrganizationMemberRoleRepository extends BaseRepository {
  constructor() {
    super(OrganizationMemberRole);
  }
}

module.exports = new OrganizationMemberRoleRepository();
