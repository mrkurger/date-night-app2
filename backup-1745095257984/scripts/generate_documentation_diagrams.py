#!/usr/bin/env python3
# ===================================================
# CUSTOMIZABLE SETTINGS IN THIS FILE
# ===================================================
# This file contains settings for the documentation diagram generator
# 
# COMMON CUSTOMIZATIONS:
# - DIAGRAMS_TO_GENERATE: List of diagrams to generate
# - OUTPUT_DIRECTORY: Directory to output diagrams to
# ===================================================

import os
import sys
import json
from pathlib import Path

# Configuration
DIAGRAMS_TO_GENERATE = [
    "architecture",
    "component_hierarchy",
    "data_flow",
    "database_schema",
    "api_endpoints"
]

OUTPUT_DIRECTORY = "docs/images"

# Diagram definitions
DIAGRAMS = {
    "architecture": {
        "title": "System Architecture",
        "description": "High-level architecture of the Date Night App",
        "content": """
graph TD
    Client[Client Browser] --> |HTTP/HTTPS| LB[Load Balancer]
    LB --> |HTTP| Web[Web Server]
    Web --> |HTTP| API[API Server]
    API --> |TCP| DB[(MongoDB)]
    API --> |HTTP| Auth[Auth Service]
    API --> |HTTP| Media[Media Service]
    API --> |HTTP| Payment[Payment Service]
    API --> |HTTP| Notification[Notification Service]
    Auth --> |TCP| AuthDB[(Auth DB)]
    Media --> |TCP| S3[S3 Storage]
    Payment --> |HTTP| Stripe[Stripe API]
    Notification --> |SMTP| Email[Email Service]
    Notification --> |HTTP| Push[Push Notification Service]
"""
    },
    "component_hierarchy": {
        "title": "Angular Component Hierarchy",
        "description": "Component hierarchy of the Angular client",
        "content": """
graph TD
    App[App Component] --> Nav[Navigation Component]
    App --> Router[Router Outlet]
    Router --> Home[Home Component]
    Router --> Auth[Auth Module]
    Router --> Ads[Ads Module]
    Router --> Profile[Profile Module]
    Router --> Chat[Chat Module]
    Router --> Travel[Travel Module]
    Router --> Payment[Payment Module]
    
    Auth --> Login[Login Component]
    Auth --> Register[Register Component]
    Auth --> ForgotPassword[Forgot Password Component]
    
    Ads --> AdList[Ad List Component]
    Ads --> AdDetail[Ad Detail Component]
    Ads --> AdForm[Ad Form Component]
    Ads --> AdSearch[Ad Search Component]
    
    Profile --> UserProfile[User Profile Component]
    Profile --> EditProfile[Edit Profile Component]
    Profile --> UserAds[User Ads Component]
    
    Chat --> ConversationList[Conversation List Component]
    Chat --> MessageList[Message List Component]
    Chat --> MessageForm[Message Form Component]
    
    Travel --> TravelList[Travel List Component]
    Travel --> TravelForm[Travel Form Component]
    Travel --> TravelMap[Travel Map Component]
    
    Payment --> PaymentMethods[Payment Methods Component]
    Payment --> AddPaymentMethod[Add Payment Method Component]
    Payment --> PaymentHistory[Payment History Component]
"""
    },
    "data_flow": {
        "title": "Data Flow Diagram",
        "description": "Data flow in the Date Night App",
        "content": """
graph LR
    User[User] --> |Input| UI[User Interface]
    UI --> |HTTP Request| API[API Server]
    API --> |Query| DB[(Database)]
    DB --> |Results| API
    API --> |HTTP Response| UI
    UI --> |Display| User
    
    API --> |Event| EventBus[Event Bus]
    EventBus --> |Notification| NotificationService[Notification Service]
    NotificationService --> |Email| User
    NotificationService --> |Push| User
    
    API --> |Payment Request| PaymentService[Payment Service]
    PaymentService --> |Process Payment| PaymentProvider[Payment Provider]
    PaymentProvider --> |Confirmation| PaymentService
    PaymentService --> |Update| API
"""
    },
    "database_schema": {
        "title": "Database Schema",
        "description": "MongoDB schema for the Date Night App",
        "content": """
classDiagram
    class User {
        +String _id
        +String email
        +String password
        +String name
        +String role
        +Date createdAt
        +Date updatedAt
    }
    
    class Advertisement {
        +String _id
        +String title
        +String description
        +Number price
        +String category
        +Object location
        +Array images
        +Array tags
        +String user
        +Date createdAt
        +Date updatedAt
    }
    
    class TravelLocation {
        +String _id
        +String city
        +String country
        +Array coordinates
        +Date startDate
        +Date endDate
        +String notes
        +String user
        +Date createdAt
        +Date updatedAt
    }
    
    class Conversation {
        +String _id
        +Array participants
        +Date createdAt
        +Date updatedAt
    }
    
    class Message {
        +String _id
        +String text
        +String sender
        +String conversation
        +Date createdAt
    }
    
    class PaymentMethod {
        +String _id
        +String user
        +String type
        +Object details
        +Date createdAt
        +Date updatedAt
    }
    
    class Payment {
        +String _id
        +String user
        +Number amount
        +String currency
        +String status
        +String description
        +String paymentMethod
        +Date createdAt
        +Date updatedAt
    }
    
    User "1" -- "n" Advertisement : creates
    User "1" -- "n" TravelLocation : plans
    User "1" -- "n" Conversation : participates
    User "1" -- "n" Message : sends
    User "1" -- "n" PaymentMethod : owns
    User "1" -- "n" Payment : makes
    Conversation "1" -- "n" Message : contains
"""
    },
    "api_endpoints": {
        "title": "API Endpoints",
        "description": "API endpoints for the Date Night App",
        "content": """
graph TD
    API[API] --> Auth[Authentication]
    API --> Users[User Management]
    API --> Ads[Advertisement Management]
    API --> Travel[Travel Itinerary]
    API --> Chat[Chat]
    API --> Media[Media Management]
    API --> Payment[Payment]
    
    Auth --> Login[POST /api/v1/auth/login]
    Auth --> Register[POST /api/v1/auth/register]
    Auth --> RefreshToken[POST /api/v1/auth/refresh-token]
    Auth --> Logout[POST /api/v1/auth/logout]
    
    Users --> GetProfile[GET /api/v1/users/profile]
    Users --> UpdateProfile[PUT /api/v1/users/profile]
    Users --> DeleteUser[DELETE /api/v1/users/profile]
    
    Ads --> CreateAd[POST /api/v1/ads]
    Ads --> GetAds[GET /api/v1/ads]
    Ads --> GetAdById[GET /api/v1/ads/:id]
    Ads --> UpdateAd[PUT /api/v1/ads/:id]
    Ads --> DeleteAd[DELETE /api/v1/ads/:id]
    
    Travel --> AddLocation[POST /api/v1/travel]
    Travel --> GetLocations[GET /api/v1/travel]
    Travel --> UpdateLocation[PUT /api/v1/travel/:id]
    Travel --> DeleteLocation[DELETE /api/v1/travel/:id]
    
    Chat --> GetConversations[GET /api/v1/chat/conversations]
    Chat --> GetMessages[GET /api/v1/chat/conversations/:id/messages]
    Chat --> SendMessage[POST /api/v1/chat/conversations/:id/messages]
    
    Media --> UploadMedia[POST /api/v1/media/upload]
    Media --> DeleteMedia[DELETE /api/v1/media/:filename]
    
    Payment --> CreateIntent[POST /api/v1/payments/create-intent]
    Payment --> GetMethods[GET /api/v1/payments/methods]
    Payment --> AddMethod[POST /api/v1/payments/methods]
"""
    }
}

def generate_mermaid_diagram(diagram_name, output_directory):
    """
    Generate a Mermaid diagram.
    """
    if diagram_name not in DIAGRAMS:
        print(f"Diagram {diagram_name} not found.")
        return False
    
    diagram = DIAGRAMS[diagram_name]
    
    # Create the output directory if it doesn't exist
    os.makedirs(output_directory, exist_ok=True)
    
    # Create the Mermaid file
    mermaid_path = os.path.join(output_directory, f"{diagram_name}.mmd")
    with open(mermaid_path, 'w', encoding='utf-8') as f:
        f.write(diagram["content"])
    
    # Create the Markdown file
    markdown_path = os.path.join(output_directory, f"{diagram_name}.md")
    with open(markdown_path, 'w', encoding='utf-8') as f:
        f.write(f"# {diagram['title']}\n\n")
        f.write(f"{diagram['description']}\n\n")
        f.write("```mermaid\n")
        f.write(diagram["content"])
        f.write("\n```\n")
    
    print(f"Generated {diagram_name} diagram.")
    return True

def main():
    """
    Main function to generate documentation diagrams.
    """
    print("Generating documentation diagrams...")
    
    # Get project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Create the output directory
    output_directory = os.path.join(project_root, OUTPUT_DIRECTORY)
    os.makedirs(output_directory, exist_ok=True)
    
    # Generate diagrams
    for diagram_name in DIAGRAMS_TO_GENERATE:
        generate_mermaid_diagram(diagram_name, output_directory)
    
    print(f"Diagrams generated in {output_directory}.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())