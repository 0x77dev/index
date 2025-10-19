{ pkgs, lib, config, inputs, ... }:

{
  name = "index";

  languages.javascript = {
    enable = true;
    bun = {
      enable = true;
      install.enable = true;
    };
  };

  dotenv.enable = true;

  git-hooks.hooks.eslint = {
    enable = true;
    settings.binPath = "./node_modules/.bin/eslint";
  };
}
