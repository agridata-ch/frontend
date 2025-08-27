module.exports = {
  branchPrefix: 'renovate/',
  repositories: ['agridata-ch/frontend'],
  extends: [':semanticCommitTypeAll(feat)', ':dependencyDashboard'],
  separateMinorPatch: true,
  patch: {
    enabled: false,
  },
  packageRules: [
    {
      matchDatasources: ['npm'],
      minimumReleaseAge: '180 days',
    },
  ],
};
