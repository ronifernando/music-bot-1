'use strict';

const GoogleUrl      = require('google-url');
const pkg            = require('../package');
const Bot            = require('./Bot');
const env            = process.env;
const PlaybackHelper = require('./Module/MusicModule/Helper/PlaybackHelper');
const DJHelper       = require('./Module/MusicModule/Helper/DJHelper');

function shortener(key) {
    return new GoogleUrl({key: key});
}

try {
    var config = require('../config.json');

    env.DISCORD_ADMIN_ID     = config.admin_id;
    env.DISCORD_TOKEN        = config.token;
    env.DISCORD_PREFIX       = config.prefix;
    env.DISCORD_CHANNEL_NAME = config.channel_name;
    env.DISCORD_GOOGLE_KEY   = config.google_key;
    env.DISCORD_DOWNLOAD_DIR = config.download_dir;
    env.DISCORD_REDIS_URL    = config.redis_url;
    env.DISCORD_MONGO_URL    = config.mongo_url;
    env.DISCORD_VOLUME       = config.volume;
} catch (e) {
    console.log('Config file not found, falling back on environment variables.');
}

let options = {
    admin_id:  env.DISCORD_ADMIN_ID,
    token:     env.DISCORD_TOKEN,
    name:      pkg.name,
    version:   pkg.version,
    author:    pkg.author,
    modules:   [
        require('./Module/MusicModule/MusicModule')
    ],
    prefix:    env.DISCORD_PREFIX,
    redis_url: env.DISCORD_REDIS_URL,
    mongo_url: env.DISCORD_MONGO_URL,
    queue:     {
        host: env.DISCORD_RABBIT_HOST
    },
    container: (Bot) => {
        return {
            parameters: {
                download_dir:       env.DISCORD_DOWNLOAD_DIR,
                channel_name:       env.DISCORD_CHANNEL_NAME,
                skip_count:         3,
                remove_after_skips: 5,
                volume:             parseFloat(env.DISCORD_VOLUME)
            },
            services:   {
                urlShortener:      {module: shortener, args: [env.DISCORD_GOOGLE_KEY]},
                'helper.dj':       {module: DJHelper, args: ['@client']},
                'helper.playback': {
                    module: PlaybackHelper,
                    args:   [
                        '@dispatcher',
                        '@client',
                        '@logger',
                        '@brain.redis',
                        '@brain.memory',
                        '%download_dir%',
                        '%volume%',
                        '%remove_after_skips%'
                    ]
                }
            }
        };
    }
};

let environment = 'prod';
if (env.DISCORD_ENV !== undefined) {
    environment = env.DISCORD_ENV;
}

new Bot(environment, false && environment === 'dev', options);
