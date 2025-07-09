#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display usage
function show_usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  dev           Start development environment"
    echo "  prod          Start production environment"
    echo "  build         Build all services"
    echo "  down          Stop and remove all containers"
    echo "  logs          Show logs for all services"
    echo "  restart       Restart all services"
    echo "  shell         Open shell in API container"
    echo "  db:backup     Create a backup of the database"
    echo "  db:restore    Restore database from backup"
    echo "  help          Show this help message"
    echo ""
    echo "Options:"
    echo "  -f, --force   Force rebuild of containers"
    echo "  -v, --verbose Show more detailed output"
}

# Function to start development environment
function start_dev() {
    echo -e "${GREEN}🚀 Starting development environment...${NC}"
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d $@
}

# Function to start production environment
function start_prod() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}⚠️  .env file not found. Creating from example...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env file with your configuration and run again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}🚀 Starting production environment...${NC}"
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d $@
}

# Function to build services
function build_services() {
    echo -e "${GREEN}🔨 Building services...${NC}"
    docker-compose build $@
}

# Function to stop and remove containers
function stop_containers() {
    echo -e "${GREEN}🛑 Stopping and removing containers...${NC}"
    docker-compose down $@
}

# Function to show logs
function show_logs() {
    docker-compose logs -f $@
}

# Function to restart services
function restart_services() {
    echo -e "${GREEN}🔄 Restarting services...${NC}"
    docker-compose restart $@
}

# Function to open shell in API container
function open_shell() {
    docker-compose exec api sh
}

# Function to backup database
function backup_database() {
    local timestamp=$(date +%Y%m%d%H%M%S)
    local backup_file="database/backup_${timestamp}.db"
    
    echo -e "${GREEN}💾 Creating database backup to ${backup_file}...${NC}"
    cp database/pedidos.db "${backup_file}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup created successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed to create backup${NC}"
    fi
}

# Function to restore database
function restore_database() {
    local backup_file=$1
    
    if [ -z "${backup_file}" ]; then
        echo -e "${YELLOW}⚠️  Please specify a backup file to restore${NC}"
        echo "Available backups:"
        ls -l database/backup_*.db 2>/dev/null || echo "No backup files found in database/ directory"
        return 1
    fi
    
    if [ ! -f "${backup_file}" ]; then
        echo -e "${YELLOW}⚠️  Backup file not found: ${backup_file}${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}⚠️  WARNING: This will overwrite your current database!${NC}"
    read -p "Are you sure you want to continue? [y/N] " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}🔄 Restoring database from ${backup_file}...${NC}"
        cp "${backup_file}" database/pedidos.db
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database restored successfully${NC}"
            echo -e "${YELLOW}⚠️  You may need to restart the API container${NC}"
        else
            echo -e "${YELLOW}⚠️  Failed to restore database${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Database restore cancelled${NC}"
    fi
}

# Parse command line arguments
command=$1
shift

# Parse options
force_rebuild=false
verbose=false

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -f|--force)
            force_rebuild=true
            shift
            ;;
        -v|--verbose)
            verbose=true
            shift
            ;;
        *)
            shift
            ;;
    esq
done

# Set Docker Compose command with verbose flag if needed
dc_cmd="docker-compose"
if [ "$verbose" = true ]; then
    dc_cmd="$dc_cmd --verbose"
fi

# Execute command
case $command in
    dev)
        if [ "$force_rebuild" = true ]; then
            build_services
        fi
        start_dev
        ;;
    prod)
        if [ "$force_rebuild" = true ]; then
            build_services --no-cache
        fi
        start_prod
        ;;
    build)
        build_services $@
        ;;
    down)
        stop_containers $@
        ;;
    logs)
        show_logs $@
        ;;
    restart)
        restart_services $@
        ;;
    shell)
        open_shell
        ;;
    db:backup)
        backup_database
        ;;
    db:restore)
        restore_database $1
        ;;
    help|--help|-h|*)
        show_usage
        ;;
esac
