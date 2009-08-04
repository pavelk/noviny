# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_noviny_session',
  :secret      => 'a01f7dc24e43c984b0ff8a3c3f434d3960e1073b14b1f4e9f7c2074d4016b7ee497fdc85304f8a879ebba2f8eaa6046f46949e7b95f66d182ad87946847337bf'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
