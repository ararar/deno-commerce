export const run = () => {
  return `
  TRUNCATE auth_users;

  INSERT INTO auth_users (user_login,user_pass,user_email,user_registered,user_activation_key,display_name)
  VALUES ("admin", PASSWORD("password"), "admin@admin.com", NOW(), UUID(), "admin");
  `;
};
