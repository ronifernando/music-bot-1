const AbstractCommand = require('discord-bot-base').AbstractCommand;

class QueueCommand extends AbstractCommand {
    static get name() {
        return 'queuechannel';
    }

    static get description() {
        return 'Marks the given channel as the queue channel';
    }

    initialize() {
        this.helper = this.container.get('helper.playback');
        this.brain = this.container.get('helper.redis');
    }

    handle() {
        if (!this.container.get('helper.dj').isDJ(this.message.server, this.message.author)) {
            return;
        }

        this.responds(/^queue(?: )?channel <#(\d+)>$/, (matches) => {
            let channel = this.message.server.channels.get('id', matches[1]);

            if (!channel) {
                return this.sendMessage(this.message.channel, 'Couldn\'t find that channel, for some reason.');
            }

            this.helper.setQueueChannel(channel.id);
            this.sendMessage(this.message.channel, 'Queue channel has been set to ' + channel.mention());
        });
    }
}

module.exports = QueueCommand;