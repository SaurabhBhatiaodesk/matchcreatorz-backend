// module.exports = {
//     apps : [
// 		{
// 			name: "matchcreatorsapp-dev-api",
// 			script: "dist/apps/user/main.js",
// 			restartDelay: 1000,
// 			watch: false,
// 			max_memory_restart: "200M",
//             log_type: "json"
// 		},
//         {
// 			name: "matchcreatorsapp-dev-admin",
// 			script: "dist/apps/admin/main.js",
// 			restartDelay: 1000,
// 			watch: false,
// 			max_memory_restart: "200M",
//             log_type: "json"
// 		},
// 		{
// 			name: "matchcreatorsapp-dev-socket",
// 			script: "dist/apps/socket/main.js",
// 			restartDelay: 1000,
// 			watch: false,
// 			max_memory_restart: "200M",
//             log_type: "json"
// 		}
//     ]
// };


module.exports = {
  apps: [
    {
      name: "matchcreatorsapp-dev-api",
      script: "dist/apps/user/apps/user/src/main.js",
      restartDelay: 1000,
      watch: false,
      max_memory_restart: "200M",
      log_type: "json",
    },
    {
      name: "matchcreatorsapp-dev-admin",
      script: "dist/apps/admin/apps/admin/src/main.js",
      restartDelay: 1000,
      watch: false,
      max_memory_restart: "200M",
      log_type: "json",
    },
    {
      name: "matchcreatorsapp-dev-socket",
      script: "dist/apps/socket/apps/socket/src/main.js",
      restartDelay: 1000,
      watch: false,
      max_memory_restart: "200M",
      log_type: "json",
    },
  ],
};

