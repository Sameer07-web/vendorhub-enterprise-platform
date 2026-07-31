const BaseRepository = require('./BaseRepository');
const OrganizationRole = require('../models/OrganizationRole');

class OrganizationRoleRepository extends BaseRepository {
  constructor() {
    super(OrganizationRole);
  }
}

module.exports = new OrganizationRoleRepository();
