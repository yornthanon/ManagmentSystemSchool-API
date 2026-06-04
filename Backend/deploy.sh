#!/bin/bash
# ================================================================
# Automated Docker Deployment Script
# School Management System
# ================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ================================================================
# Functions
# ================================================================

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# ================================================================
# Checks
# ================================================================

check_docker() {
    print_header "Checking Docker Installation"

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
    fi
    print_success "Docker found: $(docker --version)"

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
    fi
    print_success "Docker Compose found: $(docker-compose --version)"
}

check_env_file() {
    print_header "Checking Environment Configuration"

    if [ ! -f .env ]; then
        print_warning ".env file not found"
        print_warning "Creating from .env.example..."

        if [ ! -f .env.example ]; then
            print_error ".env.example not found"
        fi

        cp .env.example .env
        print_success ".env created from template"
        print_warning "IMPORTANT: Edit .env with your actual credentials before deploying!"
        print_warning "Run: nano .env"
        exit 1
    fi
    print_success ".env file found"
}

# ================================================================
# Deployment Menu
# ================================================================

show_menu() {
    echo -e "\n${BLUE}Select deployment option:${NC}"
    echo "1) Local development (Docker Compose)"
    echo "2) Build Docker image only"
    echo "3) Build and push to Docker Hub"
    echo "4) Stop all containers"
    echo "5) View logs"
    echo "6) Health check"
    echo "7) Exit"
    echo ""
}

# ================================================================
# Deployment Options
# ================================================================

deploy_local() {
    print_header "Starting Local Development with Docker Compose"

    print_warning "Building images..."
    docker-compose build

    print_warning "Starting containers..."
    docker-compose up -d

    print_success "Containers started!"
    print_success "Waiting for database to be ready..."

    # Wait for database
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U postgres &>/dev/null; then
            print_success "Database is ready!"
            break
        fi
        echo -n "."
        sleep 1
    done

    print_header "Deployment Summary"
    echo "Application URL: http://localhost:8080"
    echo "Swagger UI: http://localhost:8080/swagger-ui.html"
    echo "Database: localhost:5433 (postgres:12345)"
    echo ""
    echo "View logs: docker-compose logs -f"
    echo "Stop services: docker-compose down"
}

build_image() {
    print_header "Building Docker Image"

    read -p "Enter image name (e.g., school-api): " image_name
    read -p "Enter image tag (e.g., latest): " image_tag

    full_image="${image_name}:${image_tag}"

    print_warning "Building $full_image..."
    docker build -t "$full_image" .

    print_success "Image built successfully!"
    print_success "Run with: docker run -p 8080:8080 --env-file .env $full_image"
}

push_to_docker_hub() {
    print_header "Building and Pushing to Docker Hub"

    read -p "Enter Docker Hub username: " docker_user
    read -p "Enter repository name (e.g., school-api): " repo_name
    read -p "Enter image tag (e.g., 1.0.0): " image_tag

    full_image="${docker_user}/${repo_name}:${image_tag}"

    print_warning "Logging in to Docker Hub..."
    docker login

    print_warning "Building image: $full_image"
    docker build -t "$full_image" .

    print_warning "Tagging as latest..."
    docker tag "$full_image" "${docker_user}/${repo_name}:latest"

    print_warning "Pushing to Docker Hub..."
    docker push "$full_image"
    docker push "${docker_user}/${repo_name}:latest"

    print_success "Image pushed successfully!"
    print_success "Pull with: docker pull $full_image"
}

stop_containers() {
    print_header "Stopping Containers"

    read -p "Remove volumes too? (y/n): " remove_volumes

    if [ "$remove_volumes" = "y" ]; then
        print_warning "Stopping and removing volumes..."
        docker-compose down -v
        print_success "Containers and volumes removed!"
    else
        print_warning "Stopping containers..."
        docker-compose down
        print_success "Containers stopped!"
    fi
}

view_logs() {
    print_header "Viewing Logs"
    echo "1) All services"
    echo "2) App service only"
    echo "3) Database service only"
    read -p "Choose (1-3): " log_choice

    case $log_choice in
        1) docker-compose logs -f ;;
        2) docker-compose logs -f app ;;
        3) docker-compose logs -f postgres ;;
        *) print_error "Invalid choice" ;;
    esac
}

health_check() {
    print_header "Health Check"

    echo "Checking services..."
    docker-compose ps

    echo -e "\nChecking application..."
    if curl -s http://localhost:8080/swagger-ui.html &> /dev/null; then
        print_success "Application is running!"
    else
        print_error "Application is not responding"
    fi

    echo -e "\nChecking database..."
    if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        print_success "Database is running!"
    else
        print_error "Database is not responding"
    fi
}

# ================================================================
# Main
# ================================================================

main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════╗"
    echo "║  School Management System - Docker Deployment     ║"
    echo "╚════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    check_docker
    check_env_file

    while true; do
        show_menu
        read -p "Enter choice (1-7): " choice

        case $choice in
            1) deploy_local ;;
            2) build_image ;;
            3) push_to_docker_hub ;;
            4) stop_containers ;;
            5) view_logs ;;
            6) health_check ;;
            7) print_success "Exit"; exit 0 ;;
            *) print_error "Invalid choice, please try again" ;;
        esac
    done
}

# Run main function
main

