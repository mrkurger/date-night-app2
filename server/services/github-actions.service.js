// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains GitHub Actions integration service
//
// COMMON CUSTOMIZATIONS:
// - GITHUB_API_BASE: GitHub API base URL (default: 'https://api.github.com')
//   Related to: github-actions.routes.js:GitHubActionsService
// ===================================================

import fetch from 'node-fetch';

/**
 * Service for GitHub Actions integration
 * Provides methods for monitoring and interacting with GitHub workflows
 */
export class GitHubActionsService {
  constructor() {
    this.owner = process.env.GITHUB_OWNER || 'mrkurger';
    this.repo = process.env.GITHUB_REPO || 'date-night-app2';
    this.token = process.env.GITHUB_TOKEN;
    this.apiBase = 'https://api.github.com';
  }

  /**
   * Get headers for GitHub API requests
   */
  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'date-night-app2'
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    return headers;
  }

  /**
   * Get current workflow status
   */
  async getWorkflowStatus() {
    try {
      const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/actions/runs?status=in_progress&per_page=10`;
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        running_workflows: data.workflow_runs?.length || 0,
        workflows: data.workflow_runs?.map(run => ({
          id: run.id,
          name: run.name,
          status: run.status,
          conclusion: run.conclusion,
          created_at: run.created_at,
          updated_at: run.updated_at,
          html_url: run.html_url
        })) || []
      };
    } catch (error) {
      console.error('Error fetching workflow status:', error);
      return {
        running_workflows: 0,
        workflows: [],
        error: error.message
      };
    }
  }

  /**
   * Get recent workflow runs
   */
  async getRecentRuns(limit = 10) {
    try {
      const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/actions/runs?per_page=${limit}`;
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.workflow_runs?.map(run => ({
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        created_at: run.created_at,
        updated_at: run.updated_at,
        html_url: run.html_url,
        head_branch: run.head_branch,
        event: run.event,
        actor: {
          login: run.actor.login,
          avatar_url: run.actor.avatar_url
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching recent runs:', error);
      return [];
    }
  }

  /**
   * Trigger a workflow dispatch event
   */
  async triggerWorkflow(workflowId, inputs = {}) {
    try {
      const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/actions/workflows/${workflowId}/dispatches`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: inputs
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return {
        success: true,
        message: 'Workflow dispatch triggered successfully'
      };
    } catch (error) {
      console.error('Error triggering workflow:', error);
      throw error;
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus() {
    try {
      const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/deployments?per_page=5`;
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const deployments = await response.json();
      
      const deploymentsWithStatus = await Promise.all(
        deployments.map(async (deployment) => {
          try {
            const statusUrl = `${this.apiBase}/repos/${this.owner}/${this.repo}/deployments/${deployment.id}/statuses`;
            const statusResponse = await fetch(statusUrl, {
              headers: this.getHeaders()
            });

            let statuses = [];
            if (statusResponse.ok) {
              statuses = await statusResponse.json();
            }

            return {
              id: deployment.id,
              environment: deployment.environment,
              ref: deployment.ref,
              created_at: deployment.created_at,
              updated_at: deployment.updated_at,
              status: statuses[0]?.state || 'unknown',
              description: statuses[0]?.description || '',
              target_url: statuses[0]?.target_url || ''
            };
          } catch (error) {
            console.error(`Error fetching status for deployment ${deployment.id}:`, error);
            return {
              id: deployment.id,
              environment: deployment.environment,
              ref: deployment.ref,
              created_at: deployment.created_at,
              updated_at: deployment.updated_at,
              status: 'error',
              description: 'Failed to fetch status'
            };
          }
        })
      );

      return deploymentsWithStatus;
    } catch (error) {
      console.error('Error fetching deployment status:', error);
      return [];
    }
  }
}