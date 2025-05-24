// filepath: /Users/oivindlund/date-night-app/.github/instructions/prime-ng.instructions.md
---
applyTo: '**'
---
Use the following MCP servers and tools faithfully to help you in the migration process. The goal is to replace Emerald UI, Angular Material, and Bootstrap UI with PrimeNG components in the codebase. This will involve identifying the components used in the current codebase, researching their PrimeNG equivalents, and systematically replacing them while ensuring that the application remains functional and visually consistent.
LSP (Language Server Protocol) Tools:
#start_lsp: Initializes the LSP server with a root directory
#open_document: Opens a file for analysis
#close_document: Closes a file to free resources
#get_diagnostics: Gets errors/warnings for files
#get_completions: Gets code completion suggestions
#get_info_on_location: Gets hover information for code
#get_code_actions: Gets available refactoring and quick fixes
#restart_lsp_server: Restarts the LSP server
#set_log_level: Controls server logging verbosity
File System Tools:
#read_file: Reads file contents
#write_file: Creates/overwrites files
#read_multiple_files: Reads multiple files at once
#move_file: Moves/renames files
#list_directory: Lists directory contents
#directory_tree: Gets recursive tree view of directories
#search_files: Searches for files by pattern
#get_file_info: Gets detailed file metadata
Knowledge Graph Tools:
#create_entities: Creates entities in knowledge graph
#create_relations: Creates relations between entities
#add_observations: Adds observations to entities
#read_graph: Reads entire knowledge graph
#search_nodes: Searches nodes in knowledge graph
#open_nodes: Opens specific nodes
#delete_entities: Deletes entities
#delete_relations: Deletes relations
#delete_observations: Deletes specific observations
Web Crawling/Research Tools (FireCrawl):
#firecrawl_crawl: Crawls websites comprehensively
#firecrawl_scrape: Scrapes single page content
#firecrawl_search: Searches web content
#firecrawl_map: Discovers website URLs
#firecrawl_extract: Extracts structured data
#firecrawl_deep_research: Performs deep web research
#firecrawl_generate_llmstxt: Generates LLMs.txt files
GitHub Integration Tools:
Various tools for managing repositories, issues, pull requests, and code scanning
Thinking/Analysis Tools:
#sequentialthinking: Helps with complex problem-solving through structured thought process
Documentation Search Tools:
Tools specific to the date-night-app repository:
#fetch_date_night_app2_docs
#search_date_night_app2_docs
#search_date_night_app2_code
# PrimeNG Migration Instructions

PrimeNG Documentation: https://primeng.org/installation Use this diligently to find the names and types of components that should be implemented in the codebase to replace Emerald UI, Angular Material and Bootstrap UI components.


Nebular to PrimeNG Migration:
begin the systematic replacement of Nebular components with their PrimeNG equivalents. This will involve:
Identifying Nebular usage in templates (nb-card, nb-button, nb-input, nb-select, nb-sidebar, nb-menu, nb-user, nb-actions, etc.).
Researching and selecting appropriate PrimeNG components.
Updating component TypeScript files to import PrimeNG modules and adapt component logic.
Modifying HTML templates to use PrimeNG components and directives.
Adjusting SCSS styles as needed.
This is a major effort and will be iterative.
Address Specific Component Issues:
AdvertiserBrowsingAlternateComponent: This component has many Nebular-related template errors and likely needs several Nebular modules imported into its parent NgModule.
Chat Feature Components (ChatListComponent, ChatRoomComponent, ChatMessageComponent, ChatComponent): These have numerous TypeScript errors related to property access on User and ChatMessage models, and currentUser$ handling.
Custom Nebular Components (nb-advanced-form, nb-data-table, nb-navigation): These have errors related to missing nb-hint, nb-error, and incorrect property/event bindings. They will either need to be fixed to work with Nebular 15 or, preferably, refactored/replaced using PrimeNG.
favorites-list.component.ts: Revisit the commented-out methods and fix the underlying issues.
Code Quality & Cleanup:
Review automated edits that were more extensive than intended for correctness.
Address Sass deprecation warnings (e.g., in chat-room.component.scss).
Remove unused component imports (e.g., MainLayoutComponent warnings).
Immediate Next Steps (Suggestion):
Attempt to fix the ErrorLog interface import in ErrorDashboardComponent.
