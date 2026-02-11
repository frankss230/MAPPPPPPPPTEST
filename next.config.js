/** @type {import('next').NextConfig} */ 
const nextConfig = {
	env: {
	  AppStatus                : process.env.APP_STATUS,
	  GoogleMapsApiKey         : process.env.GOOGLE_MAPS_API_KEY,
	  CHANNEL_ACCESS_TOKEN_LINE: process.env.CHANNEL_ACCESS_TOKEN_LINE,
	  WEB_API_URL              : process.env.WEB_API_URL,
	  WEB_DOMAIN               : process.env.WEB_DOMAIN,
	  CRYPTOJS_SECRET_KEY      : process.env.CRYPTOJS_SECRET_KEY,
	  SECRET_KEY               : process.env.SECRET_KEY,
	},
	async headers() {
	  return [
		
	  ];
	},
  };
  
  module.exports = nextConfig;
  