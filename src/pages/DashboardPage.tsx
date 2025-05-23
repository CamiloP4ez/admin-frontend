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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MAX_RECENT_ITEMS = 5;

const formatDateForAxis = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}`; // DD/MM
};

const DashboardPage: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalComments, setTotalComments] = useState<number | null>(null);

  const [postsChartData, setPostsChartData] = useState<
    { date: string; count: number }[]
  >([]);
  const [usersChartData, setUsersChartData] = useState<
    { date: string; count: number }[]
  >([]);

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
          const userCountsByDay = aggregateByDay(sortedUsers, 7);
          setUsersChartData(userCountsByDay);
        } else {
          console.warn(
            "Could not fetch users for dashboard stats:",
            usersResponse.message
          );
        }

        if (postsResponse.data && postsResponse.code === 200) {
          setTotalPosts(postsResponse.data.length);

          setRecentPosts(postsResponse.data.slice(0, MAX_RECENT_ITEMS));
          const postCountsByDay = aggregateByDay(postsResponse.data, 7);
          setPostsChartData(postCountsByDay);
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

  const aggregateByDay = (
    items: Array<{ createdAt: string }>,
    numberOfDays: number
  ) => {
    const counts: { [key: string]: number } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar al inicio del día

    // Inicializar los últimos N días con 0 cuentas
    for (let i = 0; i < numberOfDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split("T")[0]; // YYYY-MM-DD
      counts[dateString] = 0;
    }

    items.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      itemDate.setHours(0, 0, 0, 0); // Normalizar al inicio del día

      const diffTime = Math.abs(today.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < numberOfDays) {
        // Solo contar items dentro del rango de días
        const dateString = itemDate.toISOString().split("T")[0]; // YYYY-MM-DD
        if (counts[dateString] !== undefined) {
          // Asegurarse que el día está en nuestro rango inicializado
          counts[dateString]++;
        }
      }
    });

    // Convertir a formato para Recharts [{date: 'YYYY-MM-DD', count: X}] y ordenar
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ordenar por fecha ascendente
  };

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
          <div className="charts-section">
            <h2>Análisis de Actividad (Últimos 7 días)</h2>
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Nuevas Publicaciones por Día</h3>
                {postsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={postsChartData}
                      margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDateForAxis}
                        angle={-30}
                        textAnchor="end"
                        height={50}
                        interval={0} // Mostrar todos los ticks si son pocos
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        formatter={(value: number) => [value, "Publicaciones"]}
                        labelFormatter={(label: string) =>
                          `Fecha: ${formatDateForAxis(label)}`
                        }
                      />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Publicaciones"
                        fill="var(--color-success)"
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p>
                    No hay suficientes datos para el gráfico de publicaciones.
                  </p>
                )}
              </div>

              <div className="chart-card">
                <h3>Nuevos Usuarios por Día</h3>
                {usersChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={usersChartData}
                      margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDateForAxis}
                        angle={-30}
                        textAnchor="end"
                        height={50}
                        interval={0}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        formatter={(value: number) => [value, "Usuarios"]}
                        labelFormatter={(label: string) =>
                          `Fecha: ${formatDateForAxis(label)}`
                        }
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Usuarios"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No hay suficientes datos para el gráfico de usuarios.</p>
                )}
              </div>
            </div>
          </div>

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
