.DEFAULT_GOAL := help

.PHONY: help install dev build lint test preview

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*##"; print "Usage: make <command>\n"; print "Commands:"} /^[a-zA-Z_-]+:.*##/ {printf "  %-10s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	pnpm install

dev: ## Start the development server
	pnpm dev

build: ## Build the production app
	pnpm build

lint: ## Lint the code
	pnpm lint

test: ## Run the unit tests
	pnpm test

preview: ## Preview the production build
	pnpm preview
