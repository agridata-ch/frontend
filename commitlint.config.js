module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0, 'always'], // or [0, 'always'] to disable entirely
    'jira-ticket': [2, 'always'], // Add this line to enforce the rule (2 = error)
  },
  plugins: [
    {
      rules: {
        // Custom rule for checking Jira tickets in the commit message
        'jira-ticket': ({ scope }) => {
          // Check if the commit message scope matches the Jira ticket pattern
          if (!/DIGIB2-\d+/.test(scope)) {
            return [
              false,
              'Commit message must include a Jira ticket in the format DIGIB2-<ticket-number>',
            ];
          }
          return [true];
        },
      },
    },
  ],
};
