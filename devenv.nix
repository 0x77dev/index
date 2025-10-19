{ pkgs, lib, config, inputs, ... }:

{
  name = "index";

  languages.javascript = {
    enable = true;
    bun.enable = true;
    package = pkgs.nodejs_22;
  };

  dotenv.enable = true;
}
