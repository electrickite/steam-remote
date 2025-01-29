export default {
  // Server port number
  port: 3000,

  // Base path (if used)
  base: '',

  // Default timeout for child processes (ms)
  proc_timeout: 4000,

  // List of bearer tokens allowed to access the API
  // Tokens provided using an Authorization: Bearer request header
  // An empty array allows unauthenticated  access
  tokens: [
    // 'secret1',
    // 'secret2',
  ],

  // List of accounts and account ID numbers allowed by the API
  accounts: [
    // ['username1', 1234],
    // ['username2', 5678],
  ],

  // Steam path information. Not normally changed.
  steam: {
    bin: 'Steam.exe',
    dir: 'C:\\Program Files (x86)\\Steam\\',
    reg: 'HKCU\\Software\\Valve\\Steam',
    delay: 6000,
  },
};
