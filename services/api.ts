/// <reference types="vite/client" />
import type { UserData, User, Project, Transport, Tax, Utility, Benefit } from '../types';

// Read-only REST API, versioned under /api/v1 and described in docs/openapi.yaml.
// The responses are JSON files served next to the app (see public/api/v1).
const API_BASE = `${import.meta.env.BASE_URL}api/v1`;

async function get<T>(resource: string): Promise<T> {
    const response = await fetch(`${API_BASE}/${resource}.json`);
    if (!response.ok) {
        throw new Error(`GET /api/v1/${resource}.json failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
}

/** Loads everything the portal shows, one request per resource. */
export async function loadUserData(): Promise<UserData> {
    const [user, projects, transport, taxes, utilities, benefits] = await Promise.all([
        get<User>('user'),
        get<Project[]>('projects'),
        get<Transport>('transport'),
        get<Tax[]>('taxes'),
        get<Utility[]>('utilities'),
        get<Benefit[]>('benefits'),
    ]);
    return { user, projects, transport, taxes, utilities, benefits };
}
