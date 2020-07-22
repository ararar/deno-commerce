/** Runs on migrate */
export const up = () => {
  return `
    CREATE TABLE auth_users (
      id BIGINT(20) NOT NULL AUTO_INCREMENT,
      user_login VARCHAR(50),
      user_pass VARCHAR(255),
      user_email VARCHAR(100),
      user_registered DATETIME,
      user_activation_key VARCHAR(255),
      display_name VARCHAR(50),
      CONSTRAINT auth_users_pk PRIMARY KEY (id)
    );
  `;
};

/** Runs on rollback */
export const down = () => {
  return `
    DROP TABLE IF EXISTS auth_users;
  `;
};
