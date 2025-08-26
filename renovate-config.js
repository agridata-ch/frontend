module.exports = {
  branchPrefix: 'renovate/',
  repositories: ['agridata-ch/frontend'],
  extends: [':semanticCommitTypeAll(feat)', ':dependencyDashboard'],
  separateMinorPatch: true,
  patch: {
    enabled: false,
  },
};
