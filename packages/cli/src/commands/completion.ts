/**
 * Shell completion installation command
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { colors } from "../utils/colors.ts";

const BASH_COMPLETION = `#!/usr/bin/env bash

_forge_cli_completions() {
  local cur prev commands subcommands options

  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  # Main commands
  commands="config servers s sites deployments d databases db database-users daemons env nginx certificates certs firewall-rules fw ssh-keys backups commands scheduled-jobs user monitors nginx-templates security-rules redirect-rules recipes completion help"

  # Subcommands for each command
  local config_cmds="set get delete"
  local servers_cmds="list ls get reboot"
  local sites_cmds="list ls get"
  local deployments_cmds="list ls deploy"
  local databases_cmds="list ls get"
  local database_users_cmds="list ls get create delete"
  local daemons_cmds="list ls get restart"
  local env_cmds="get update"
  local nginx_cmds="get update"
  local certificates_cmds="list ls get activate"
  local firewall_rules_cmds="list ls get"
  local ssh_keys_cmds="list ls get"
  local backups_cmds="list ls get create delete"
  local commands_cmds="list ls get create"
  local scheduled_jobs_cmds="list ls get create delete"
  local user_cmds="get"
  local monitors_cmds="list ls get create delete"
  local nginx_templates_cmds="list ls get create update delete"
  local security_rules_cmds="list ls get create delete"
  local redirect_rules_cmds="list ls get create delete"
  local recipes_cmds="list ls get run"
  local completion_cmds="bash zsh fish"

  # Global options
  options="--token --server --site -f --format --no-color -h --help -v --version --name --command --content --from --to --provider --frequency --type --operator --threshold --minutes --key --port --ip-address --user --script --servers --domain --password --credential-id --region --size --project-type --directory"

  # Format options
  local formats="json human table"

  # Completion logic
  case "\${COMP_CWORD}" in
    1)
      # Complete main commands
      COMPREPLY=( $(compgen -W "\${commands}" -- "\${cur}") )
      ;;
    2)
      # Complete subcommands based on main command
      case "\${prev}" in
        config)
          COMPREPLY=( $(compgen -W "\${config_cmds}" -- "\${cur}") )
          ;;
        servers|s)
          COMPREPLY=( $(compgen -W "\${servers_cmds}" -- "\${cur}") )
          ;;
        sites)
          COMPREPLY=( $(compgen -W "\${sites_cmds}" -- "\${cur}") )
          ;;
        deployments|d)
          COMPREPLY=( $(compgen -W "\${deployments_cmds}" -- "\${cur}") )
          ;;
        databases|db)
          COMPREPLY=( $(compgen -W "\${databases_cmds}" -- "\${cur}") )
          ;;
        database-users)
          COMPREPLY=( $(compgen -W "\${database_users_cmds}" -- "\${cur}") )
          ;;
        daemons)
          COMPREPLY=( $(compgen -W "\${daemons_cmds}" -- "\${cur}") )
          ;;
        env)
          COMPREPLY=( $(compgen -W "\${env_cmds}" -- "\${cur}") )
          ;;
        nginx)
          COMPREPLY=( $(compgen -W "\${nginx_cmds}" -- "\${cur}") )
          ;;
        certificates|certs)
          COMPREPLY=( $(compgen -W "\${certificates_cmds}" -- "\${cur}") )
          ;;
        firewall-rules|fw)
          COMPREPLY=( $(compgen -W "\${firewall_rules_cmds}" -- "\${cur}") )
          ;;
        ssh-keys)
          COMPREPLY=( $(compgen -W "\${ssh_keys_cmds}" -- "\${cur}") )
          ;;
        backups)
          COMPREPLY=( $(compgen -W "\${backups_cmds}" -- "\${cur}") )
          ;;
        commands)
          COMPREPLY=( $(compgen -W "\${commands_cmds}" -- "\${cur}") )
          ;;
        scheduled-jobs)
          COMPREPLY=( $(compgen -W "\${scheduled_jobs_cmds}" -- "\${cur}") )
          ;;
        user)
          COMPREPLY=( $(compgen -W "\${user_cmds}" -- "\${cur}") )
          ;;
        monitors)
          COMPREPLY=( $(compgen -W "\${monitors_cmds}" -- "\${cur}") )
          ;;
        nginx-templates)
          COMPREPLY=( $(compgen -W "\${nginx_templates_cmds}" -- "\${cur}") )
          ;;
        security-rules)
          COMPREPLY=( $(compgen -W "\${security_rules_cmds}" -- "\${cur}") )
          ;;
        redirect-rules)
          COMPREPLY=( $(compgen -W "\${redirect_rules_cmds}" -- "\${cur}") )
          ;;
        recipes)
          COMPREPLY=( $(compgen -W "\${recipes_cmds}" -- "\${cur}") )
          ;;
        completion)
          COMPREPLY=( $(compgen -W "\${completion_cmds}" -- "\${cur}") )
          ;;
        *)
          COMPREPLY=( $(compgen -W "\${options}" -- "\${cur}") )
          ;;
      esac
      ;;
    *)
      # Complete options and their values
      case "\${prev}" in
        --format|-f)
          COMPREPLY=( $(compgen -W "\${formats}" -- "\${cur}") )
          ;;
        --token|--server|--site|--name|--command|--content|--from|--to|--provider|--frequency|--type|--operator|--threshold|--minutes|--key|--port|--ip-address|--user|--script|--servers|--domain|--password|--credential-id|--region|--size|--project-type|--directory)
          # No completion for values requiring arguments
          COMPREPLY=()
          ;;
        *)
          COMPREPLY=( $(compgen -W "\${options}" -- "\${cur}") )
          ;;
      esac
      ;;
  esac

  return 0
}

complete -F _forge_cli_completions forge-cli
`;

const ZSH_COMPLETION = `#compdef forge-cli

_forge_cli() {
  local line state

  _arguments -C \\
    '1: :->command' \\
    '2: :->subcommand' \\
    '*: :->args'

  case $state in
    command)
      local -a commands
      commands=(
        'config:Manage CLI configuration'
        'servers:Manage servers'
        's:Manage servers (alias)'
        'sites:Manage sites'
        'deployments:Manage deployments'
        'd:Manage deployments (alias)'
        'databases:Manage databases'
        'db:Manage databases (alias)'
        'database-users:Manage database users'
        'daemons:Manage daemons'
        'env:Manage environment variables'
        'nginx:Manage nginx configuration'
        'certificates:Manage SSL certificates'
        'certs:Manage SSL certificates (alias)'
        'firewall-rules:Manage firewall rules'
        'fw:Manage firewall rules (alias)'
        'ssh-keys:Manage SSH keys'
        'backups:Manage backup configurations'
        'commands:Manage site commands'
        'scheduled-jobs:Manage scheduled jobs'
        'user:Display authenticated user profile'
        'monitors:Manage server monitors'
        'nginx-templates:Manage Nginx templates'
        'security-rules:Manage site security rules'
        'redirect-rules:Manage site redirect rules'
        'recipes:Manage recipes'
        'completion:Generate shell completion script'
        'help:Show help'
      )
      _describe 'command' commands
      ;;
    subcommand)
      case $line[1] in
        config)
          local -a config_cmds
          config_cmds=(
            'set:Save API token'
            'get:Show current token'
            'delete:Delete stored token'
          )
          _describe 'config command' config_cmds
          ;;
        servers|s)
          local -a servers_cmds
          servers_cmds=(
            'list:List all servers'
            'ls:List all servers (alias)'
            'get:Get server details'
            'reboot:Reboot a server'
          )
          _describe 'servers command' servers_cmds
          ;;
        sites)
          local -a sites_cmds
          sites_cmds=(
            'list:List sites'
            'ls:List sites (alias)'
            'get:Get site details'
          )
          _describe 'sites command' sites_cmds
          ;;
        deployments|d)
          local -a deployments_cmds
          deployments_cmds=(
            'list:List deployments'
            'ls:List deployments (alias)'
            'deploy:Trigger a deployment'
          )
          _describe 'deployments command' deployments_cmds
          ;;
        databases|db)
          local -a databases_cmds
          databases_cmds=(
            'list:List databases'
            'ls:List databases (alias)'
            'get:Get database details'
          )
          _describe 'databases command' databases_cmds
          ;;
        database-users)
          local -a database_users_cmds
          database_users_cmds=(
            'list:List database users'
            'ls:List database users (alias)'
            'get:Get database user details'
            'create:Create a database user'
            'delete:Delete a database user'
          )
          _describe 'database-users command' database_users_cmds
          ;;
        daemons)
          local -a daemons_cmds
          daemons_cmds=(
            'list:List daemons'
            'ls:List daemons (alias)'
            'get:Get daemon details'
            'restart:Restart a daemon'
          )
          _describe 'daemons command' daemons_cmds
          ;;
        env)
          local -a env_cmds
          env_cmds=(
            'get:Get env variables'
            'update:Update env variables'
          )
          _describe 'env command' env_cmds
          ;;
        nginx)
          local -a nginx_cmds
          nginx_cmds=(
            'get:Get nginx config'
            'update:Update nginx config'
          )
          _describe 'nginx command' nginx_cmds
          ;;
        certificates|certs)
          local -a certificates_cmds
          certificates_cmds=(
            'list:List certificates'
            'ls:List certificates (alias)'
            'get:Get certificate details'
            'activate:Activate a certificate'
          )
          _describe 'certificates command' certificates_cmds
          ;;
        firewall-rules|fw)
          local -a firewall_rules_cmds
          firewall_rules_cmds=(
            'list:List firewall rules'
            'ls:List firewall rules (alias)'
            'get:Get firewall rule details'
          )
          _describe 'firewall-rules command' firewall_rules_cmds
          ;;
        ssh-keys)
          local -a ssh_keys_cmds
          ssh_keys_cmds=(
            'list:List SSH keys'
            'ls:List SSH keys (alias)'
            'get:Get SSH key details'
          )
          _describe 'ssh-keys command' ssh_keys_cmds
          ;;
        backups)
          local -a backups_cmds
          backups_cmds=(
            'list:List backup configurations'
            'ls:List backup configurations (alias)'
            'get:Get backup configuration details'
            'create:Create a backup configuration'
            'delete:Delete a backup configuration'
          )
          _describe 'backups command' backups_cmds
          ;;
        commands)
          local -a commands_cmds
          commands_cmds=(
            'list:List commands'
            'ls:List commands (alias)'
            'get:Get command details'
            'create:Execute a command'
          )
          _describe 'commands command' commands_cmds
          ;;
        scheduled-jobs)
          local -a scheduled_jobs_cmds
          scheduled_jobs_cmds=(
            'list:List scheduled jobs'
            'ls:List scheduled jobs (alias)'
            'get:Get scheduled job details'
            'create:Create a scheduled job'
            'delete:Delete a scheduled job'
          )
          _describe 'scheduled-jobs command' scheduled_jobs_cmds
          ;;
        user)
          local -a user_cmds
          user_cmds=(
            'get:Get the authenticated user profile'
          )
          _describe 'user command' user_cmds
          ;;
        monitors)
          local -a monitors_cmds
          monitors_cmds=(
            'list:List monitors'
            'ls:List monitors (alias)'
            'get:Get monitor details'
            'create:Create a monitor'
            'delete:Delete a monitor'
          )
          _describe 'monitors command' monitors_cmds
          ;;
        nginx-templates)
          local -a nginx_templates_cmds
          nginx_templates_cmds=(
            'list:List Nginx templates'
            'ls:List Nginx templates (alias)'
            'get:Get Nginx template details'
            'create:Create a Nginx template'
            'update:Update a Nginx template'
            'delete:Delete a Nginx template'
          )
          _describe 'nginx-templates command' nginx_templates_cmds
          ;;
        security-rules)
          local -a security_rules_cmds
          security_rules_cmds=(
            'list:List security rules'
            'ls:List security rules (alias)'
            'get:Get security rule details'
            'create:Create a security rule'
            'delete:Delete a security rule'
          )
          _describe 'security-rules command' security_rules_cmds
          ;;
        redirect-rules)
          local -a redirect_rules_cmds
          redirect_rules_cmds=(
            'list:List redirect rules'
            'ls:List redirect rules (alias)'
            'get:Get redirect rule details'
            'create:Create a redirect rule'
            'delete:Delete a redirect rule'
          )
          _describe 'redirect-rules command' redirect_rules_cmds
          ;;
        recipes)
          local -a recipes_cmds
          recipes_cmds=(
            'list:List all recipes'
            'ls:List all recipes (alias)'
            'get:Get recipe details'
            'run:Run a recipe'
          )
          _describe 'recipes command' recipes_cmds
          ;;
        completion)
          local -a completion_cmds
          completion_cmds=(
            'bash:Generate Bash completion script'
            'zsh:Generate Zsh completion script'
            'fish:Generate Fish completion script'
          )
          _describe 'completion shell' completion_cmds
          ;;
      esac
      ;;
    args)
      _arguments \\
        '--token[API token]:token:' \\
        '--server[Server ID]:server id:' \\
        '--site[Site ID]:site id:' \\
        '(-f --format)'{-f,--format}'[Output format]:format:(json human table)' \\
        '--no-color[Disable colored output]' \\
        '(-h --help)'{-h,--help}'[Show help]' \\
        '(-v --version)'{-v,--version}'[Show version]' \\
        '--name[Name]:name:' \\
        '--command[Command]:command:' \\
        '--content[Content]:content:' \\
        '--from[From]:from:' \\
        '--to[To]:to:' \\
        '--provider[Provider]:provider:' \\
        '--frequency[Frequency]:frequency:' \\
        '--type[Type]:type:' \\
        '--operator[Operator]:operator:' \\
        '--threshold[Threshold]:threshold:' \\
        '--minutes[Minutes]:minutes:' \\
        '--key[Key]:key:' \\
        '--port[Port]:port:' \\
        '--ip-address[IP address]:ip address:' \\
        '--user[User]:user:' \\
        '--script[Script]:script:' \\
        '--servers[Servers]:servers:' \\
        '--domain[Domain]:domain:' \\
        '--password[Password]:password:' \\
        '--credential-id[Credential ID]:credential id:' \\
        '--region[Region]:region:' \\
        '--size[Size]:size:' \\
        '--project-type[Project type]:project type:' \\
        '--directory[Directory]:directory:'
      ;;
  esac
}

_forge_cli "$@"
`;

const FISH_COMPLETION = `# Completions for forge-cli

# Main commands
complete -c forge-cli -f -n "__fish_use_subcommand" -a "config" -d "Manage CLI configuration"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "servers" -d "Manage servers"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "s" -d "Manage servers (alias)"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "sites" -d "Manage sites"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "deployments" -d "Manage deployments"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "d" -d "Manage deployments (alias)"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "databases" -d "Manage databases"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "db" -d "Manage databases (alias)"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "database-users" -d "Manage database users"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "daemons" -d "Manage daemons"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "env" -d "Manage environment variables"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "nginx" -d "Manage nginx configuration"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "certificates" -d "Manage SSL certificates"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "certs" -d "Manage SSL certificates (alias)"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "firewall-rules" -d "Manage firewall rules"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "fw" -d "Manage firewall rules (alias)"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "ssh-keys" -d "Manage SSH keys"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "backups" -d "Manage backup configurations"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "commands" -d "Manage site commands"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "scheduled-jobs" -d "Manage scheduled jobs"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "user" -d "Display authenticated user profile"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "monitors" -d "Manage server monitors"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "nginx-templates" -d "Manage Nginx templates"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "security-rules" -d "Manage site security rules"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "redirect-rules" -d "Manage site redirect rules"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "recipes" -d "Manage recipes"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "completion" -d "Generate shell completion script"
complete -c forge-cli -f -n "__fish_use_subcommand" -a "help" -d "Show help"

# config subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from config" -a "set" -d "Save API token"
complete -c forge-cli -f -n "__fish_seen_subcommand_from config" -a "get" -d "Show current token"
complete -c forge-cli -f -n "__fish_seen_subcommand_from config" -a "delete" -d "Delete stored token"

# servers subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from servers s" -a "list" -d "List all servers"
complete -c forge-cli -f -n "__fish_seen_subcommand_from servers s" -a "ls" -d "List all servers (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from servers s" -a "get" -d "Get server details"
complete -c forge-cli -f -n "__fish_seen_subcommand_from servers s" -a "reboot" -d "Reboot a server"

# sites subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from sites" -a "list" -d "List sites"
complete -c forge-cli -f -n "__fish_seen_subcommand_from sites" -a "ls" -d "List sites (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from sites" -a "get" -d "Get site details"

# deployments subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from deployments d" -a "list" -d "List deployments"
complete -c forge-cli -f -n "__fish_seen_subcommand_from deployments d" -a "ls" -d "List deployments (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from deployments d" -a "deploy" -d "Trigger a deployment"

# databases subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from databases db" -a "list" -d "List databases"
complete -c forge-cli -f -n "__fish_seen_subcommand_from databases db" -a "ls" -d "List databases (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from databases db" -a "get" -d "Get database details"

# database-users subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from database-users" -a "list" -d "List database users"
complete -c forge-cli -f -n "__fish_seen_subcommand_from database-users" -a "ls" -d "List database users (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from database-users" -a "get" -d "Get database user details"
complete -c forge-cli -f -n "__fish_seen_subcommand_from database-users" -a "create" -d "Create a database user"
complete -c forge-cli -f -n "__fish_seen_subcommand_from database-users" -a "delete" -d "Delete a database user"

# daemons subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from daemons" -a "list" -d "List daemons"
complete -c forge-cli -f -n "__fish_seen_subcommand_from daemons" -a "ls" -d "List daemons (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from daemons" -a "get" -d "Get daemon details"
complete -c forge-cli -f -n "__fish_seen_subcommand_from daemons" -a "restart" -d "Restart a daemon"

# env subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from env" -a "get" -d "Get env variables"
complete -c forge-cli -f -n "__fish_seen_subcommand_from env" -a "update" -d "Update env variables"

# nginx subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from nginx" -a "get" -d "Get nginx config"
complete -c forge-cli -f -n "__fish_seen_subcommand_from nginx" -a "update" -d "Update nginx config"

# certificates subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from certificates certs" -a "list" -d "List certificates"
complete -c forge-cli -f -n "__fish_seen_subcommand_from certificates certs" -a "ls" -d "List certificates (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from certificates certs" -a "get" -d "Get certificate details"
complete -c forge-cli -f -n "__fish_seen_subcommand_from certificates certs" -a "activate" -d "Activate a certificate"

# firewall-rules subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from firewall-rules fw" -a "list" -d "List firewall rules"
complete -c forge-cli -f -n "__fish_seen_subcommand_from firewall-rules fw" -a "ls" -d "List firewall rules (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from firewall-rules fw" -a "get" -d "Get firewall rule details"

# ssh-keys subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from ssh-keys" -a "list" -d "List SSH keys"
complete -c forge-cli -f -n "__fish_seen_subcommand_from ssh-keys" -a "ls" -d "List SSH keys (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from ssh-keys" -a "get" -d "Get SSH key details"

# backups subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from backups" -a "list" -d "List backup configurations"
complete -c forge-cli -f -n "__fish_seen_subcommand_from backups" -a "ls" -d "List backup configurations (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from backups" -a "get" -d "Get backup configuration details"
complete -c forge-cli -f -n "__fish_seen_subcommand_from backups" -a "create" -d "Create a backup configuration"
complete -c forge-cli -f -n "__fish_seen_subcommand_from backups" -a "delete" -d "Delete a backup configuration"

# commands subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from commands" -a "list" -d "List commands"
complete -c forge-cli -f -n "__fish_seen_subcommand_from commands" -a "ls" -d "List commands (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from commands" -a "get" -d "Get command details"
complete -c forge-cli -f -n "__fish_seen_subcommand_from commands" -a "create" -d "Execute a command"

# scheduled-jobs subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from scheduled-jobs" -a "list" -d "List scheduled jobs"
complete -c forge-cli -f -n "__fish_seen_subcommand_from scheduled-jobs" -a "ls" -d "List scheduled jobs (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from scheduled-jobs" -a "get" -d "Get scheduled job details"
complete -c forge-cli -f -n "__fish_seen_subcommand_from scheduled-jobs" -a "create" -d "Create a scheduled job"
complete -c forge-cli -f -n "__fish_seen_subcommand_from scheduled-jobs" -a "delete" -d "Delete a scheduled job"

# user subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from user" -a "get" -d "Get the authenticated user profile"

# monitors subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from monitors" -a "list" -d "List monitors"
complete -c forge-cli -f -n "__fish_seen_subcommand_from monitors" -a "ls" -d "List monitors (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from monitors" -a "get" -d "Get monitor details"
complete -c forge-cli -f -n "__fish_seen_subcommand_from monitors" -a "create" -d "Create a monitor"
complete -c forge-cli -f -n "__fish_seen_subcommand_from monitors" -a "delete" -d "Delete a monitor"

# nginx-templates subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from nginx-templates" -a "list" -d "List Nginx templates"
complete -c forge-cli -f -n "__fish_seen_subcommand_from nginx-templates" -a "ls" -d "List Nginx templates (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from nginx-templates" -a "get" -d "Get Nginx template details"
complete -c forge-cli -f -n "__fish_seen_subcommand_from nginx-templates" -a "create" -d "Create a Nginx template"
complete -c forge-cli -f -n "__fish_seen_subcommand_from nginx-templates" -a "update" -d "Update a Nginx template"
complete -c forge-cli -f -n "__fish_seen_subcommand_from nginx-templates" -a "delete" -d "Delete a Nginx template"

# security-rules subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from security-rules" -a "list" -d "List security rules"
complete -c forge-cli -f -n "__fish_seen_subcommand_from security-rules" -a "ls" -d "List security rules (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from security-rules" -a "get" -d "Get security rule details"
complete -c forge-cli -f -n "__fish_seen_subcommand_from security-rules" -a "create" -d "Create a security rule"
complete -c forge-cli -f -n "__fish_seen_subcommand_from security-rules" -a "delete" -d "Delete a security rule"

# redirect-rules subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from redirect-rules" -a "list" -d "List redirect rules"
complete -c forge-cli -f -n "__fish_seen_subcommand_from redirect-rules" -a "ls" -d "List redirect rules (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from redirect-rules" -a "get" -d "Get redirect rule details"
complete -c forge-cli -f -n "__fish_seen_subcommand_from redirect-rules" -a "create" -d "Create a redirect rule"
complete -c forge-cli -f -n "__fish_seen_subcommand_from redirect-rules" -a "delete" -d "Delete a redirect rule"

# recipes subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from recipes" -a "list" -d "List all recipes"
complete -c forge-cli -f -n "__fish_seen_subcommand_from recipes" -a "ls" -d "List all recipes (alias)"
complete -c forge-cli -f -n "__fish_seen_subcommand_from recipes" -a "get" -d "Get recipe details"
complete -c forge-cli -f -n "__fish_seen_subcommand_from recipes" -a "run" -d "Run a recipe"

# completion subcommands
complete -c forge-cli -f -n "__fish_seen_subcommand_from completion" -a "bash" -d "Install Bash completion"
complete -c forge-cli -f -n "__fish_seen_subcommand_from completion" -a "zsh" -d "Install Zsh completion"
complete -c forge-cli -f -n "__fish_seen_subcommand_from completion" -a "fish" -d "Install Fish completion"

# Global options
complete -c forge-cli -l token -d "API token" -r
complete -c forge-cli -l server -d "Server ID" -r
complete -c forge-cli -l site -d "Site ID" -r
complete -c forge-cli -s f -l format -d "Output format" -xa "json human table"
complete -c forge-cli -l no-color -d "Disable colored output"
complete -c forge-cli -s h -l help -d "Show help"
complete -c forge-cli -s v -l version -d "Show version"
complete -c forge-cli -l name -d "Name" -r
complete -c forge-cli -l command -d "Command" -r
complete -c forge-cli -l content -d "Content" -r
complete -c forge-cli -l from -d "From" -r
complete -c forge-cli -l to -d "To" -r
complete -c forge-cli -l provider -d "Provider" -r
complete -c forge-cli -l frequency -d "Frequency" -r
complete -c forge-cli -l type -d "Type" -r
complete -c forge-cli -l operator -d "Operator" -r
complete -c forge-cli -l threshold -d "Threshold" -r
complete -c forge-cli -l minutes -d "Minutes" -r
complete -c forge-cli -l key -d "Key" -r
complete -c forge-cli -l port -d "Port" -r
complete -c forge-cli -l ip-address -d "IP address" -r
complete -c forge-cli -l user -d "User" -r
complete -c forge-cli -l script -d "Script" -r
complete -c forge-cli -l servers -d "Servers" -r
complete -c forge-cli -l domain -d "Domain" -r
complete -c forge-cli -l password -d "Password" -r
complete -c forge-cli -l credential-id -d "Credential ID" -r
complete -c forge-cli -l region -d "Region" -r
complete -c forge-cli -l size -d "Size" -r
complete -c forge-cli -l project-type -d "Project type" -r
complete -c forge-cli -l directory -d "Directory" -r
`;

/**
 * Get the appropriate completion file path for the shell
 */
function getCompletionPath(shell: string): string {
  const home = homedir();

  switch (shell) {
    case "bash":
      return join(home, ".local/share/bash-completion/completions/forge-cli");
    case "zsh":
      return join(home, ".zfunc/_forge-cli");
    case "fish": {
      const configHome = process.env["XDG_CONFIG_HOME"] ?? join(home, ".config");
      return join(configHome, "fish/completions/forge-cli.fish");
    }
    default:
      throw new Error(`Unknown shell: ${shell}`);
  }
}

export function showCompletionHelp(): void {
  console.log(`
${colors.bold("forge-cli completion")} - Install shell completion

${colors.bold("USAGE:")}
  forge-cli completion <shell> [--print]

${colors.bold("SHELLS:")}
  bash                Install Bash completion
  zsh                 Install Zsh completion
  fish                Install Fish completion

${colors.bold("OPTIONS:")}
  --print             Print completion script instead of installing

${colors.bold("INSTALLATION:")}
  The completion script is automatically installed to the appropriate
  standard directory for your shell. After installation, restart your
  shell to activate completions.

  ${colors.bold("Bash:")}
    forge-cli completion bash
    # Installs to: ~/.local/share/bash-completion/completions/forge-cli
    # Then run: exec bash

  ${colors.bold("Zsh:")}
    forge-cli completion zsh
    # Installs to: ~/.zfunc/_forge-cli
    # Ensure fpath includes ~/.zfunc (add to ~/.zshrc before compinit):
    #   fpath=(~/.zfunc $fpath)
    # Then run: exec zsh

  ${colors.bold("Fish:")}
    forge-cli completion fish
    # Installs to: ~/.config/fish/completions/forge-cli.fish
    # Completions are loaded automatically

${colors.bold("PRINT ONLY:")}
  Use --print to output the script without installing:

  forge-cli completion bash --print > my-completion.sh
  forge-cli completion zsh --print | less
`);
}

export function handleCompletionCommand(
  shell: string,
  options: Record<string, string | boolean | string[]> = {},
): void {
  const shouldPrint = options["print"] !== undefined;

  const shellLower = shell.toLowerCase();

  // Get completion script
  let script: string;
  switch (shellLower) {
    case "bash":
      script = BASH_COMPLETION;
      break;
    case "zsh":
      script = ZSH_COMPLETION;
      break;
    case "fish":
      script = FISH_COMPLETION;
      break;
    default:
      console.error(
        `${colors.red("✗")} Unknown shell: ${shell}. Supported shells: bash, zsh, fish`,
      );
      console.error(`Run ${colors.cyan("forge-cli completion --help")} for usage information.`);
      process.exit(1);
      return;
  }

  // If --print flag, just output the script
  if (shouldPrint) {
    process.stdout.write(script);
    return;
  }

  // Otherwise, install to appropriate directory
  const installPath = getCompletionPath(shellLower);
  const dir = installPath.substring(0, installPath.lastIndexOf("/"));

  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(installPath, script, "utf8");

    console.log(
      `${colors.green("✓")} Installed ${shell} completion to ${colors.cyan(installPath)}`,
    );
    console.log();
    console.log(`${colors.bold("Next steps:")}`);

    switch (shellLower) {
      case "bash":
        console.log(`  1. Restart your shell: ${colors.cyan("exec bash")}`);
        console.log(`  2. Or source the file: ${colors.cyan(`source ${installPath}`)}`);
        break;
      case "zsh":
        console.log(
          `  1. Ensure ${colors.cyan("~/.zfunc")} is in your $fpath (add to ~/.zshrc before compinit):`,
        );
        console.log(`       ${colors.cyan("fpath=(~/.zfunc $fpath)")}`);
        console.log(`  2. Restart your shell: ${colors.cyan("exec zsh")}`);
        break;
      case "fish":
        console.log(`  Completions are loaded automatically. Restart fish if needed.`);
        break;
    }
  } catch (error) {
    console.error(
      `${colors.red("✗")} Failed to install completion: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}
