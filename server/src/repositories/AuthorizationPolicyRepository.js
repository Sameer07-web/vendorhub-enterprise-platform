const BaseRepository = require('./BaseRepository');
const AuthorizationPolicy = require('../models/AuthorizationPolicy');

class AuthorizationPolicyRepository extends BaseRepository {
  constructor() {
    super(AuthorizationPolicy);
  }
}

module.exports = new AuthorizationPolicyRepository();
