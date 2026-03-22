"""
Omega AI-First IDE — Unified Data Provider
Phase 5: The Database & Endpoint Middleware

Provides a unified interface for connecting to and querying multiple
database types from within the IDE. Supports:
- PostgreSQL (via psycopg2)
- Neo4j Graph DB (via neo4j driver)
- Qdrant Vector DB (via qdrant-client)

Integrates with the agent context to enable natural language querying
of database schemas and data.
"""

import logging
from dataclasses import dataclass
from enum import Enum
from typing import Any

logger = logging.getLogger("omega.db_middleware")


class DatabaseType(str, Enum):
    POSTGRES = "postgres"
    NEO4J = "neo4j"
    QDRANT = "qdrant"


@dataclass
class DatabaseConnection:
    """Configuration for a database connection."""
    db_type: DatabaseType
    host: str
    port: int
    database: str
    username: str | None = None
    password: str | None = None
    extra_params: dict[str, Any] | None = None

    @property
    def display_name(self) -> str:
        return f"{self.db_type.value}://{self.host}:{self.port}/{self.database}"


# Default port mappings
DEFAULT_PORTS = {
    DatabaseType.POSTGRES: 5432,
    DatabaseType.NEO4J: 7687,
    DatabaseType.QDRANT: 6333,
}


class UnifiedDataProvider:
    """
    Unified data provider for the Data Explorer sidebar.

    Manages connections to multiple database types and provides a common
    interface for schema inspection, querying, and natural language interaction.
    """

    def __init__(self):
        self._connections: dict[str, DatabaseConnection] = {}
        self._active_connection: str | None = None

    def add_connection(self, name: str, config: DatabaseConnection) -> None:
        """Register a new database connection."""
        self._connections[name] = config
        logger.info(f"Added database connection: {name} ({config.display_name})")

    def remove_connection(self, name: str) -> None:
        """Remove a database connection."""
        if name in self._connections:
            del self._connections[name]
            if self._active_connection == name:
                self._active_connection = None
            logger.info(f"Removed database connection: {name}")

    def list_connections(self) -> list[dict[str, Any]]:
        """List all registered connections."""
        return [
            {
                "name": name,
                "type": conn.db_type.value,
                "display": conn.display_name,
                "active": name == self._active_connection,
            }
            for name, conn in self._connections.items()
        ]

    async def get_schema(self, connection_name: str) -> dict[str, Any]:
        """
        Retrieve the schema for a given database connection.

        Returns tables/collections/indexes depending on the database type.
        """
        conn = self._connections.get(connection_name)
        if not conn:
            return {"error": f"Connection '{connection_name}' not found"}

        if conn.db_type == DatabaseType.POSTGRES:
            return await self._get_postgres_schema(conn)
        elif conn.db_type == DatabaseType.NEO4J:
            return await self._get_neo4j_schema(conn)
        elif conn.db_type == DatabaseType.QDRANT:
            return await self._get_qdrant_schema(conn)
        else:
            return {"error": f"Unsupported database type: {conn.db_type}"}

    async def execute_query(self, connection_name: str, query: str) -> dict[str, Any]:
        """
        Execute a query against the specified database connection.

        The query format depends on the database type:
        - Postgres: SQL query
        - Neo4j: Cypher query
        - Qdrant: JSON search parameters
        """
        conn = self._connections.get(connection_name)
        if not conn:
            return {"error": f"Connection '{connection_name}' not found"}

        logger.info(f"Executing query on {connection_name}: {query[:100]}...")
        # Placeholder: actual driver integration would go here
        return {
            "connection": connection_name,
            "db_type": conn.db_type.value,
            "query": query,
            "status": "placeholder — driver integration pending",
        }

    async def natural_language_query(
        self, connection_name: str, question: str, agent_context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """
        Process a natural language question about a database table/schema.

        Uses the IDE's local agent context to generate and execute the
        appropriate database query from a plain English question.
        """
        conn = self._connections.get(connection_name)
        if not conn:
            return {"error": f"Connection '{connection_name}' not found"}

        return {
            "connection": connection_name,
            "question": question,
            "status": "nl_query_pending — requires agent integration",
            "context_provided": agent_context is not None,
        }

    async def _get_postgres_schema(self, conn: DatabaseConnection) -> dict[str, Any]:
        """Retrieve PostgreSQL schema (tables, columns, types)."""
        return {"type": "postgres", "host": conn.host, "status": "schema_retrieval_pending"}

    async def _get_neo4j_schema(self, conn: DatabaseConnection) -> dict[str, Any]:
        """Retrieve Neo4j schema (node labels, relationship types, properties)."""
        return {"type": "neo4j", "host": conn.host, "status": "schema_retrieval_pending"}

    async def _get_qdrant_schema(self, conn: DatabaseConnection) -> dict[str, Any]:
        """Retrieve Qdrant schema (collections, vector dimensions, indexes)."""
        return {"type": "qdrant", "host": conn.host, "status": "schema_retrieval_pending"}
