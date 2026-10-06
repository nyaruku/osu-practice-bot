import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, SlashCommandBuilder } from 'discord.js';
import { PoolRepository } from '@Domain/Pool/Repository/PoolRepository';
import { PoolSort, SortOrder } from '@Domain/Pool/Model/PoolModel';

const PAGE_SIZE = 15;
const BUTTON_TIMEOUT_MS = 5 * 60 * 1000;

async function renderPage(page: number, totalPages: number, sort: PoolSort, order: SortOrder) {
    const pools = await PoolRepository.getPoolSummaries(PAGE_SIZE, page * PAGE_SIZE, sort, order);
    const list = pools.map((p, i) => `${page * PAGE_SIZE + i + 1}. ${p.tournament} - ${p.round} (${p.maps} maps)`).join('\n');

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages - 1),
    );

    return {
        content: '```ps\n' +
            `${list}\n` +
            '```' +
            `Page ${page + 1} / ${totalPages}`,
        components: [buttons],
    };
}

async function list(interaction: ChatInputCommandInteraction) {
    const total = await PoolRepository.countPools();
    if (total === 0) {
        await interaction.reply('No mappools found.');
        return;
    }

    const totalPages = Math.ceil(total / PAGE_SIZE);
    let page = Math.min(Math.max((interaction.options.getInteger('page') ?? 1) - 1, 0), totalPages - 1);
    const sort = (interaction.options.getString('sort') ?? 'name') as PoolSort;
    const order = (interaction.options.getString('order') ?? 'asc') as SortOrder;

    const response = await interaction.reply({ ...(await renderPage(page, totalPages, sort, order)), withResponse: true });

    const collector = response.resource!.message!.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: BUTTON_TIMEOUT_MS,
        filter: (button) => button.user.id === interaction.user.id,
    });

    collector.on('collect', async (button) => {
        page += button.customId === 'next' ? 1 : -1;
        await button.update(await renderPage(page, totalPages, sort, order));
    });

    // Remove buttons once they stop working
    collector.on('end', () => {
        interaction.editReply({ components: [] }).catch(() => {});
    });
}

export const Mappools = {
    data: new SlashCommandBuilder()
        .setName('mappools')
        .setDescription('Mappools.')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('list')
                .setDescription('Lists all mappools.')
                .addStringOption((option) =>
                    option
                        .setName('sort')
                        .setDescription('Sort by. Default: name')
                        .addChoices(
                            { name: 'Name', value: 'name' },
                            { name: 'Pool size', value: 'size' },
                        )
                )
                .addStringOption((option) =>
                    option
                        .setName('order')
                        .setDescription('Sort order. Default: ascending')
                        .addChoices(
                            { name: 'Ascending', value: 'asc' },
                            { name: 'Descending', value: 'desc' },
                        )
                )
                .addIntegerOption((option) =>
                    option
                        .setName('page')
                        .setDescription('Page to start on.')
                        .setMinValue(1)
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        switch (interaction.options.getSubcommand()) {
            case 'list':
                await list(interaction);
                break;
        }
    },
};