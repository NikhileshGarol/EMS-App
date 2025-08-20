export const environment = {
  production: false,
  apiBaseUrl: 'http://127.0.0.1:8000',
  version: 'v1',
  endpoints: {
    login: '/auth/login',
    refreshToken: '/auth/refresh-token',
    getAllRoles: '/master/roles',
    getAllDepartements: '/master/depts',
    createEmployee: '/user/create',
    updateEmployee: '/user/update',
    user: '/user',
    getAllEmployees: '/user/all-user',
    getAllLeaves: '/leave/all',
    getLeavesById: '/leave/user-leaves',
    createLeave: '/leave/apply',
    approveLeave: '/leave/approve',
    uploadFile: '/user/upload-profile-image',
  }
};
