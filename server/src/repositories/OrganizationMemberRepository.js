const BaseRepository = require('./BaseRepository');
const OrganizationMember = require('../models/OrganizationMember');

class OrganizationMemberRepository extends BaseRepository {
  constructor() {
    super(OrganizationMember);
  }
}

module.exports = new OrganizationMemberRepository();
