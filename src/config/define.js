export const KNOWN_COMPONENTS = [
  'accordion','alert','aspect','avatar','avatar-group','badge','bar','body',
  'btn','caption','card','checkbox','cluster','code','col','container',
  'counter','date','dialog','display','divider','drawer','dropzone','file',
  'footer','grid','h1','h2','h3','h4','h5','h6','hero','input','kbd',
  'label','lead','link','list','menu','mono','multiselect','notice','otp',
  'overline','password','popover','pre','progress','prose','quote','radio',
  'range','range-dual','rating','row','search','section','segmented','select',
  'sidebar','skeleton','small','spinner','stack','stat','stepper','switch',
  'table','tabs','tag','tag-input','textarea','theme-switcher','time','toast',
  'toast-host','tooltip','topnav',
];

export const INTERACTIVE_COMPONENTS = [
  'accordion','checkbox','combobox','counter','date','dialog','drawer',
  'dropzone','file','menu','multiselect','otp','password','popover',
  'progress','radio','range-dual','rating','search','segmented','sidebar',
  'stepper','switch','table','table-columns','table-filter','tabs',
  'tag-input','theme-switcher','time','toast-host','tooltip','topnav',
];

export const KNOWN_THEMES = ['brutalist', 'corporate', 'minimal'];

export function defineConfig(config = {}) {
  return {
    prefix: config.prefix ?? 'brut',
    components: config.components ?? 'all',
    theme: config.theme ?? 'brutalist',
    themes: config.themes ?? [],
    tokens: {
      override: config.tokens?.override ?? {},
      extend: config.tokens?.extend ?? {},
    },
    variants: config.variants ?? {},
    output: {
      dir: config.output?.dir ?? 'dist',
      minify: config.output?.minify ?? true,
      manifest: config.output?.manifest ?? true,
    },
  };
}
