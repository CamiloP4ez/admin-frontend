import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAllUsers } from "../services/userService";
import { getAllPosts } from "../services/postService";
import { getAllComments } from "../services/commentService";

import "./DashboardPage.css";
import StatCard from "../components/dashboard/StatCard";
import type { UserResponseDto } from "../types/user";
import type { PostResponseDto } from "../types/post";
import type { CommentResponseDto } from "../types/comment";
import RecentActivityList from "../components/dashboard/RecentActivityList";

const MAX_RECENT_ITEMS = 5;

const DashboardPage: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalComments, setTotalComments] = useState<number | null>(null);

  const [recentUsers, setRecentUsers] = useState<UserResponseDto[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostResponseDto[]>([]);
  const [recentComments, setRecentComments] = useState<CommentResponseDto[]>(
    []
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [usersResponse, postsResponse, commentsResponse] =
          await Promise.all([getAllUsers(), getAllPosts(), getAllComments()]);

        if (usersResponse.data && usersResponse.code === 200) {
          setTotalUsers(usersResponse.data.length);

          const sortedUsers = [...usersResponse.data].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentUsers(sortedUsers.slice(0, MAX_RECENT_ITEMS));
        } else {
          console.warn(
            "Could not fetch users for dashboard stats:",
            usersResponse.message
          );
        }

        if (postsResponse.data && postsResponse.code === 200) {
          setTotalPosts(postsResponse.data.length);

          setRecentPosts(postsResponse.data.slice(0, MAX_RECENT_ITEMS));
        } else {
          console.warn(
            "Could not fetch posts for dashboard stats:",
            postsResponse.message
          );
        }
        if (commentsResponse.data && commentsResponse.code === 200) {
          setTotalComments(commentsResponse.data.length);

          setRecentComments(commentsResponse.data.slice(0, MAX_RECENT_ITEMS));
        } else {
          console.warn(
            "Could not fetch comments for dashboard stats:",
            commentsResponse.message
          );
        }
      } catch (err: unknown) {
        console.error("Error fetching dashboard data:", err);
        setError("No se pudieron cargar las estadísticas del dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatRecentUsers = () =>
    recentUsers.map((user) => ({
      id: user.id,
      title: user.username,
      date: `Registrado: ${new Date(user.createdAt).toLocaleDateString()}`,
    }));

  const formatRecentPosts = () =>
    recentPosts.map((post) => ({
      id: post.id,
      title: post.title,
      author: post.username,
      date: `Publicado: ${new Date(post.createdAt).toLocaleDateString()}`,
      link: `/posts`,
    }));

  const formatRecentComments = () =>
    recentComments.map((comment) => ({
      id: comment.id,
      title: `${comment.content.substring(0, 50)}${
        comment.content.length > 50 ? "..." : ""
      }`,
      author: comment.authorUsername,
      date: `Comentado: ${new Date(comment.createdAt).toLocaleDateString()}`,
    }));

  return (
    <div className="page-container dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {isLoading && <p>Cargando estadísticas...</p>}
      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="stats-grid">
            <StatCard
              title="Total de Usuarios"
              value={totalUsers !== null ? totalUsers.toString() : "N/A"}
              icon="U"
              linkTo="/users"
              color="var(--color-primary)"
            />
            <StatCard
              title="Total de Publicaciones"
              value={totalPosts !== null ? totalPosts.toString() : "N/A"}
              icon="P"
              linkTo="/posts"
              color="var(--color-success)"
            />
            <StatCard
              title="Total de Comentarios"
              value={totalComments !== null ? totalComments.toString() : "N/A"}
              icon="C"
              linkTo="/comments"
              color="var(--color-info, #2196F3)"
            />
          </div>

          <div className="recent-activity-section">
            <h2>Actividad Reciente</h2>
            <div className="recent-activity-grid">
              <RecentActivityList
                title="Últimos Usuarios Registrados"
                items={formatRecentUsers()}
                viewAllLink="/users"
              />
              <RecentActivityList
                title="Últimas Publicaciones"
                items={formatRecentPosts()}
                viewAllLink="/posts"
              />
              <RecentActivityList
                title="Últimos Comentarios"
                items={formatRecentComments()}
                viewAllLink="/comments"
              />
            </div>
          </div>

          <div className="quick-links-section"></div>

          <div className="quick-links-section">
            <h2>Enlaces Rápidos</h2>
            <ul>
              <li>
                <Link to="/users">Gestionar Usuarios</Link>
              </li>
              <li>
                <Link to="/posts">Gestionar Publicaciones</Link>
              </li>
              {}
              {}
              {}
              <li>
                <Link to="/admins">Gestionar Administradores (SuperAdmin)</Link>
              </li>
            </ul>
          </div>

          {}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
