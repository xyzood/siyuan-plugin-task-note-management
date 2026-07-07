import { Plugin } from "siyuan";

export function registerCustomIcons(plugin: Plugin) {
    plugin.addIcons(`
            <symbol id="iconTNProject" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                    <path d="M8 10v4"/>
                    <path d="M12 10v2"/>
                    <path d="M16 10v6"/>
                </g>
            </symbol>
        `);

    plugin.addIcons(`
            <symbol id="iconTNGrid" viewBox="0 0 1024 1024">
            <path d="M513.088 64c10.56 0 19.456 7.04 21.76 16.448l0.64 4.864-0.064 405.312h403.2c11.84 0 21.376 10.048 21.376 22.4 0 10.624-7.04 19.52-16.448 21.824l-4.864 0.64-403.264-0.064v403.2a21.888 21.888 0 0 1-22.4 21.376 22.208 22.208 0 0 1-21.76-16.448l-0.64-4.864V535.424H85.312A21.888 21.888 0 0 1 64 513.088c0-10.56 7.04-19.456 16.448-21.76l4.864-0.64h405.312V85.312c0-11.776 10.048-21.312 22.4-21.312z m317.952 522.688c29.952 0 54.272 26.752 54.272 59.712v179.2c0 32.96-24.32 59.712-54.272 59.712h-190.08c-29.952 0-54.272-26.752-54.272-59.712v-179.2c0-32.96 24.32-59.712 54.272-59.712h190.08z m-448 0c29.952 0 54.272 26.752 54.272 59.712v179.2c0 32.96-24.32 59.712-54.272 59.712h-190.08c-29.952 0-54.272-26.752-54.272-59.712v-179.2c0-32.96 24.32-59.712 54.272-59.712h190.08z m448 59.712h-190.08v179.2h190.08v-179.2z m-448 0h-190.08v179.2h190.08v-179.2z m448-507.712c29.952 0 54.272 26.752 54.272 59.712v179.2c0 32.96-24.32 59.712-54.272 59.712h-190.08c-29.952 0-54.272-26.752-54.272-59.712V198.4c0-32.96 24.32-59.712 54.272-59.712h190.08z m-448 0c29.952 0 54.272 26.752 54.272 59.712v179.2c0 32.96-24.32 59.712-54.272 59.712h-190.08c-29.952 0-54.272-26.752-54.272-59.712V198.4c0-32.96 24.32-59.712 54.272-59.712h190.08z m448 59.712h-190.08v179.2h190.08V198.4z m-448 0h-190.08v179.2h190.08V198.4z" p-id="6019"></path>
            </symbol>
        `);

    plugin.addIcons(`
            <symbol id="iconTNStatistic" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"/>
                    <path d="M18 17V9"/>
                    <path d="M13 17V5"/>
                    <path d="M8 17v-3"/>
                </g>
            </symbol>
        `);

    plugin.addIcons(`
            <symbol id="iconTNHabit" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"/>
                <path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4"/>
                <path d="M5 21h14"/>
            </symbol>
        `);
}
