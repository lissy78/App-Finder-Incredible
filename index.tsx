import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', logger(console.log))
app.use('*', cors({
  origin: '*',
  allowedHeaders: ['*'],
  allowedMethods: ['*'],
}))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

// Inicializar buckets de almacenamiento
async function initializeBuckets() {
  const buckets = [
    'make-34f10c60-user-avatars',
    'make-34f10c60-mission-images',
    'make-34f10c60-post-images'
  ]
  
  for (const bucketName of buckets) {
    try {
      const { data: existingBuckets } = await supabase.storage.listBuckets()
      const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName)
      if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, { public: false })
        console.log(`Created bucket: ${bucketName}`)
      }
    } catch (error) {
      console.log(`Error creating bucket ${bucketName}:`, error)
    }
  }
}

// Inicializar datos de ejemplo
async function initializeData() {
  try {
    // Verificar si ya existen datos
    const existingUsers = await kv.getByPrefix('user:')
    if (existingUsers.length > 0) {
      console.log('Data already initialized')
      return
    }

    // Crear usuarios de ejemplo
    const users = [
      {
        id: 'user-1',
        name: 'María Esperanza',
        email: 'maria@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b169',
        location: { lat: 3.5836, lng: -76.4951, address: 'Yumbo, Valle del Cauca, Colombia' },
        goodnessLevel: 847,
        totalMissions: 156,
        helpedPeople: 1243,
        carbonSaved: 2.8,
        streak: 23,
        rank: 'Héroe Ambiental',
        badges: ['Eco Warrior', 'Code for Good', 'Community Builder', 'Climate Champion'],
        joinedAt: new Date().toISOString()
      },
      {
        id: 'user-2',
        name: 'Carlos Andrés',
        email: 'carlos@example.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        location: { lat: 3.5853, lng: -76.4965, address: 'Centro, Yumbo, Valle del Cauca, Colombia' },
        goodnessLevel: 623,
        totalMissions: 89,
        helpedPeople: 567,
        carbonSaved: 1.9,
        streak: 12,
        rank: 'Guardián Verde',
        badges: ['Tech Helper', 'Community Impact'],
        joinedAt: new Date().toISOString()
      },
      {
        id: 'user-3',
        name: 'Ana Lucía',
        email: 'ana@example.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        location: { lat: 3.5889, lng: -76.4898, address: 'Zona Industrial, Yumbo, Valle del Cauca, Colombia' },
        goodnessLevel: 432,
        totalMissions: 67,
        helpedPeople: 234,
        carbonSaved: 1.2,
        streak: 8,
        rank: 'Activista Local',
        badges: ['Educadora', 'Protectora Ambiental'],
        joinedAt: new Date().toISOString()
      }
    ]

    // Crear misiones de ejemplo - Yumbo, Valle del Cauca, Colombia
    const missions = [
      {
        id: 'mission-1',
        title: 'Limpieza del Río Cauca - Yumbo',
        description: 'Jornada de limpieza y recuperación de la ribera del Río Cauca en el sector industrial de Yumbo. Incluye materiales y refrigerios.',
        location: { lat: 3.5836, lng: -76.4951, address: 'Ribera del Río Cauca, Yumbo, Valle del Cauca' },
        reward: 300,
        difficulty: 'Medio',
        category: 'Medio Ambiente',
        participants: ['user-1'],
        maxParticipants: 40,
        timeEstimate: '4 horas',
        createdBy: 'user-1',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mission-2',
        title: 'Desarrollo Web para PYME Local',
        description: 'Crear sitio web para pequeña empresa de reciclaje en Yumbo. Proyecto con impacto social y ambiental.',
        location: { lat: 3.5889, lng: -76.4898, address: 'Centro Empresarial Yumbo, Valle del Cauca' },
        reward: 850,
        difficulty: 'Difícil',
        category: 'Tecnología',
        participants: ['user-2'],
        maxParticipants: 3,
        timeEstimate: '3 semanas',
        createdBy: 'user-2',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mission-3',
        title: 'Huerto Urbano Escuela Verde',
        description: 'Implementar huerto urbano en escuela pública de Yumbo. Enseñar agricultura sostenible a estudiantes.',
        location: { lat: 3.5795, lng: -76.4920, address: 'I.E. José María Córdoba, Yumbo, Valle del Cauca' },
        reward: 220,
        difficulty: 'Fácil',
        category: 'Educación',
        participants: [],
        maxParticipants: 15,
        timeEstimate: '6 horas',
        createdBy: 'user-1',
        status: 'active',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'mission-4',
        title: 'Capacitación Digital Senior',
        description: 'Enseñar uso de smartphones y redes sociales a adultos mayores en el centro de Yumbo.',
        location: { lat: 3.5853, lng: -76.4965, address: 'Casa de la Cultura, Centro Yumbo, Valle del Cauca' },
        reward: 180,
        difficulty: 'Fácil',
        category: 'Tecnología',
        participants: ['user-1'],
        maxParticipants: 8,
        timeEstimate: '3 horas',
        createdBy: 'user-2',
        status: 'active',
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'mission-5',
        title: 'Reforestación Cerro Las Tres Cruces',
        description: 'Plantar árboles nativos en el cerro emblemático de Yumbo. Jornada de reforestación comunitaria.',
        location: { lat: 3.5901, lng: -76.4887, address: 'Cerro Las Tres Cruces, Yumbo, Valle del Cauca' },
        reward: 400,
        difficulty: 'Medio',
        category: 'Medio Ambiente',
        participants: ['user-1', 'user-2'],
        maxParticipants: 25,
        timeEstimate: '5 horas',
        createdBy: 'user-1',
        status: 'active',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'mission-6',
        title: 'App de Transporte Sostenible',
        description: 'Desarrollar app para optimizar rutas de transporte público en Yumbo y reducir emisiones.',
        location: { lat: 3.5820, lng: -76.4933, address: 'Terminal de Transporte, Yumbo, Valle del Cauca' },
        reward: 1200,
        difficulty: 'Difícil',
        category: 'Tecnología',
        participants: [],
        maxParticipants: 4,
        timeEstimate: '4 semanas',
        createdBy: 'user-2',
        status: 'active',
        createdAt: new Date(Date.now() - 900000).toISOString()
      }
    ]

    // Guardar datos iniciales
    for (const user of users) {
      await kv.set(`user:${user.id}`, user)
    }

    for (const mission of missions) {
      await kv.set(`mission:${mission.id}`, mission)
    }

    console.log('Initial data created successfully')
  } catch (error) {
    console.log('Error initializing data:', error)
  }
}

// Ruta de registro de usuario
app.post('/make-server-34f10c60/auth/signup', async (c) => {
  try {
    const { email, password, name, location } = await c.req.json()

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (authError) {
      return c.json({ error: `Auth error during user registration: ${authError.message}` }, 400)
    }

    // Crear perfil de usuario
    const userData = {
      id: authData.user.id,
      name,
      email,
      location: location || { lat: 3.5836, lng: -76.4951, address: 'Yumbo, Valle del Cauca, Colombia' },
      goodnessLevel: 0,
      totalMissions: 0,
      helpedPeople: 0,
      carbonSaved: 0,
      streak: 0,
      rank: 'Nuevo Miembro',
      badges: [],
      joinedAt: new Date().toISOString()
    }

    await kv.set(`user:${authData.user.id}`, userData)

    return c.json({ 
      success: true, 
      user: userData,
      message: 'Usuario registrado exitosamente'
    })
  } catch (error) {
    console.log('Registration error:', error)
    return c.json({ error: `Registration error: ${error}` }, 500)
  }
})

// Ruta para obtener perfil de usuario
app.get('/make-server-34f10c60/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user?.id) {
      return c.json({ error: 'Invalid or expired token' }, 401)
    }

    const userData = await kv.get(`user:${user.id}`)
    if (!userData) {
      return c.json({ error: 'User profile not found' }, 404)
    }

    return c.json({ success: true, user: userData })
  } catch (error) {
    console.log('Profile fetch error:', error)
    return c.json({ error: `Profile fetch error: ${error}` }, 500)
  }
})

// Ruta para obtener misiones
app.get('/make-server-34f10c60/missions', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '0')
    const limit = parseInt(c.req.query('limit') || '20')
    const category = c.req.query('category')
    const lat = parseFloat(c.req.query('lat') || '0')
    const lng = parseFloat(c.req.query('lng') || '0')
    const radius = parseFloat(c.req.query('radius') || '50') // radio en km

    const allMissions = await kv.getByPrefix('mission:')
    let filteredMissions = allMissions.filter(mission => mission.status === 'active')

    // Filtrar por categoría si se especifica
    if (category && category !== 'Todas') {
      filteredMissions = filteredMissions.filter(mission => mission.category === category)
    }

    // Filtrar por proximidad geográfica si se proporcionan coordenadas
    if (lat !== 0 && lng !== 0) {
      filteredMissions = filteredMissions.filter(mission => {
        const distance = calculateDistance(lat, lng, mission.location.lat, mission.location.lng)
        return distance <= radius
      }).map(mission => ({
        ...mission,
        distance: `${calculateDistance(lat, lng, mission.location.lat, mission.location.lng).toFixed(1)} km`
      }))
    }

    // Ordenar por fecha de creación (más recientes primero)
    filteredMissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Paginación
    const startIndex = page * limit
    const paginatedMissions = filteredMissions.slice(startIndex, startIndex + limit)

    return c.json({ 
      success: true, 
      missions: paginatedMissions,
      total: filteredMissions.length,
      page,
      hasMore: startIndex + limit < filteredMissions.length,
      location: lat !== 0 && lng !== 0 ? { lat, lng } : null
    })
  } catch (error) {
    console.log('Missions fetch error:', error)
    return c.json({ error: `Missions fetch error: ${error}` }, 500)
  }
})

// Función para calcular distancia entre dos puntos geográficos
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Ruta para crear una nueva misión
app.post('/make-server-34f10c60/missions/create', async (c) => {
  try {
    const missionData = await c.req.json()
    
    // Generar ID único para la misión
    const missionId = `mission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newMission = {
      id: missionId,
      ...missionData,
      participants: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      verificationRequired: true,
      applicants: []
    }
    
    // Guardar la misión
    await kv.set(`mission:${missionId}`, newMission)
    
    return c.json({
      success: true,
      mission: newMission,
      message: 'Mission created successfully'
    })
  } catch (error) {
    console.log('Create mission error:', error)
    return c.json({ error: `Create mission error: ${error}` }, 500)
  }
})

// Ruta para unirse a una misión
app.post('/make-server-34f10c60/missions/:id/join', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user?.id) {
      return c.json({ error: 'Invalid or expired token' }, 401)
    }

    const missionId = c.req.param('id')
    const mission = await kv.get(`mission:${missionId}`)
    
    if (!mission) {
      return c.json({ error: 'Mission not found' }, 404)
    }

    // Verificar si el usuario ya está participando
    if (mission.participants.includes(user.id)) {
      return c.json({ error: 'Already participating in this mission' }, 400)
    }

    // Verificar capacidad
    if (mission.participants.length >= mission.maxParticipants) {
      return c.json({ error: 'Mission is full' }, 400)
    }

    // Agregar usuario a la misión
    mission.participants.push(user.id)
    await kv.set(`mission:${missionId}`, mission)

    return c.json({ 
      success: true, 
      mission,
      message: 'Successfully joined mission'
    })
  } catch (error) {
    console.log('Join mission error:', error)
    return c.json({ error: `Join mission error: ${error}` }, 500)
  }
})

// Ruta para completar una misión
app.post('/make-server-34f10c60/missions/:id/complete', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user?.id) {
      return c.json({ error: 'Invalid or expired token' }, 401)
    }

    const missionId = c.req.param('id')
    const { proofDescription, completionNotes } = await c.req.json()
    
    const mission = await kv.get(`mission:${missionId}`)
    if (!mission) {
      return c.json({ error: 'Mission not found' }, 404)
    }

    // Verificar que el usuario está participando
    if (!mission.participants.includes(user.id)) {
      return c.json({ error: 'User not participating in this mission' }, 400)
    }

    // Crear registro de finalización
    const completionId = `completion-${Date.now()}-${user.id}`
    const completion = {
      id: completionId,
      missionId,
      userId: user.id,
      proofDescription,
      completionNotes,
      submittedAt: new Date().toISOString(),
      status: 'pending_verification',
      verificationRequested: true
    }

    await kv.set(`completion:${completionId}`, completion)

    // Actualizar misión
    if (!mission.completions) mission.completions = []
    mission.completions.push(completionId)
    await kv.set(`mission:${missionId}`, mission)

    return c.json({
      success: true,
      completion,
      message: 'Mission completion submitted for verification'
    })
  } catch (error) {
    console.log('Complete mission error:', error)
    return c.json({ error: `Complete mission error: ${error}` }, 500)
  }
})

// Ruta para verificar una misión completada
app.post('/make-server-34f10c60/missions/:id/verify', async (c) => {
  try {
    const { completionId, rating, testimonial, paymentConfirmed } = await c.req.json()
    
    const completion = await kv.get(`completion:${completionId}`)
    if (!completion) {
      return c.json({ error: 'Completion not found' }, 404)
    }

    // Actualizar completion con verificación
    completion.status = 'verified'
    completion.rating = rating
    completion.testimonial = testimonial
    completion.paymentConfirmed = paymentConfirmed
    completion.verifiedAt = new Date().toISOString()
    
    await kv.set(`completion:${completionId}`, completion)

    // Actualizar stats del usuario
    const userData = await kv.get(`user:${completion.userId}`)
    if (userData) {
      userData.totalMissions = (userData.totalMissions || 0) + 1
      userData.goodnessLevel += rating * 50 // Bonificación basada en rating
      userData.helpedPeople = (userData.helpedPeople || 0) + 1
      
      // Actualizar racha
      const today = new Date().toDateString()
      const lastActive = userData.lastActiveDate
      if (lastActive === today) {
        // Ya activo hoy, no cambiar racha
      } else if (lastActive === new Date(Date.now() - 86400000).toDateString()) {
        // Activo ayer, continuar racha
        userData.streak = (userData.streak || 0) + 1
      } else {
        // Romper racha, empezar nueva
        userData.streak = 1
      }
      userData.lastActiveDate = today
      
      await kv.set(`user:${completion.userId}`, userData)
    }

    return c.json({
      success: true,
      completion,
      message: 'Mission verified successfully'
    })
  } catch (error) {
    console.log('Verify mission error:', error)
    return c.json({ error: `Verify mission error: ${error}` }, 500)
  }
})

// Ruta para obtener currículum del usuario
app.get('/make-server-34f10c60/user/:id/resume', async (c) => {
  try {
    const userId = c.req.param('id')
    
    // Obtener datos del usuario
    const userData = await kv.get(`user:${userId}`)
    if (!userData) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Obtener misiones completadas verificadas
    const allCompletions = await kv.getByPrefix('completion:')
    const userCompletions = allCompletions.filter(comp => 
      comp.userId === userId && comp.status === 'verified'
    )

    // Obtener logros
    const achievements = [
      {
        id: '1',
        name: 'Primer Paso',
        description: 'Completaste tu primera misión',
        icon: '🏆',
        unlockedAt: userCompletions[0]?.verifiedAt,
        category: 'Progreso',
        rarity: 'common',
        unlocked: userCompletions.length >= 1
      },
      {
        id: '2',
        name: 'Trabajador Constante',
        description: 'Completaste 5 misiones',
        icon: '💪',
        unlockedAt: userCompletions[4]?.verifiedAt,
        category: 'Progreso',
        rarity: 'rare',
        unlocked: userCompletions.length >= 5
      },
      {
        id: '3',
        name: 'Estrella Brillante',
        description: 'Recibiste una calificación perfecta de 5 estrellas',
        icon: '⭐',
        unlockedAt: userCompletions.find(c => c.rating === 5)?.verifiedAt,
        category: 'Excelencia',
        rarity: 'epic',
        unlocked: userCompletions.some(c => c.rating === 5)
      }
    ].filter(achievement => achievement.unlocked)

    return c.json({
      success: true,
      userData,
      completedMissions: userCompletions,
      achievements,
      stats: {
        totalMissions: userCompletions.length,
        averageRating: userCompletions.length > 0 
          ? userCompletions.reduce((sum, comp) => sum + comp.rating, 0) / userCompletions.length 
          : 0,
        totalEarnings: userCompletions.length * 45000, // Mock calculation
        skillsCount: 8 + userCompletions.length, // Mock calculation
        currentStreak: userData.streak || 0
      }
    })
  } catch (error) {
    console.log('Resume fetch error:', error)
    return c.json({ error: `Resume fetch error: ${error}` }, 500)
  }
})

// Ruta para obtener currículum personalizado del usuario
app.get('/make-server-34f10c60/user/:id/resume/personalized', async (c) => {
  try {
    const userId = c.req.param('id')
    const viewerId = c.req.query('viewerId')
    
    // Obtener datos del usuario
    const userData = await kv.get(`user:${userId}`)
    if (!userData) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Obtener datos del viewer si existe
    let viewerData = null
    if (viewerId) {
      viewerData = await kv.get(`user:${viewerId}`)
    }

    // Obtener misiones completadas verificadas
    const allCompletions = await kv.getByPrefix('completion:')
    const userCompletions = allCompletions.filter(comp => 
      comp.userId === userId && comp.status === 'verified'
    )

    // Filtrar misiones relevantes para el viewer
    let relevantMissions = []
    let personalizedMessage = ''

    if (viewerData) {
      // Buscar misiones en categorías que le interesan al viewer
      const viewerInterests = viewerData.favoriteCategories || ['Tecnología', 'Medio Ambiente']
      relevantMissions = userCompletions.filter(comp => 
        comp.category && viewerInterests.includes(comp.category)
      ).slice(0, 3)

      personalizedMessage = `Este currículum ha sido personalizado para ti, ${viewerData.name}. Destacamos las ${relevantMissions.length} misiones más relevantes basadas en tus intereses en ${viewerInterests.join(', ')}.`
    }

    return c.json({
      success: true,
      userData,
      completedMissions: userCompletions,
      relevantMissions,
      personalizedMessage,
      viewerData
    })
  } catch (error) {
    console.log('Personalized resume fetch error:', error)
    return c.json({ error: `Personalized resume fetch error: ${error}` }, 500)
  }
})

// Ruta para matching de usuarios por nivel
app.get('/make-server-34f10c60/users/match', async (c) => {
  try {
    const userId = c.req.query('userId')
    const userLevel = parseInt(c.req.query('userLevel') || '0')
    const levelFilter = c.req.query('levelFilter') || 'similar'

    // Obtener todos los usuarios
    const allUsers = await kv.getByPrefix('user:')
    
    let matchedUsers = []

    if (levelFilter === 'similar') {
      // Usuarios con nivel similar (+/- 150 puntos)
      matchedUsers = allUsers.filter(user => 
        user.id !== userId &&
        Math.abs(user.goodnessLevel - userLevel) <= 150
      )
    } else if (levelFilter === 'higher') {
      // Usuarios con nivel superior
      matchedUsers = allUsers.filter(user => 
        user.id !== userId &&
        user.goodnessLevel > userLevel &&
        user.goodnessLevel <= userLevel + 300
      )
    } else {
      // Todos los usuarios excepto el actual
      matchedUsers = allUsers.filter(user => user.id !== userId)
    }

    // Calcular match score basado en nivel, intereses y ubicación
    matchedUsers = matchedUsers.map(user => {
      let matchScore = 100

      // Score por diferencia de nivel (mientras más cerca, mejor)
      const levelDiff = Math.abs(user.goodnessLevel - userLevel)
      matchScore -= Math.min(levelDiff / 10, 30)

      // Agregar datos adicionales
      return {
        ...user,
        matchScore: Math.max(Math.round(matchScore), 50),
        skills: ['Trabajo en equipo', 'Responsabilidad', 'Comunicación'],
        favoriteCategories: user.badges?.slice(0, 2) || ['Medio Ambiente']
      }
    })

    // Ordenar por match score
    matchedUsers.sort((a, b) => b.matchScore - a.matchScore)

    return c.json({
      success: true,
      users: matchedUsers.slice(0, 20), // Limitar a 20 usuarios
      totalCount: matchedUsers.length
    })
  } catch (error) {
    console.log('User matching error:', error)
    return c.json({ error: `User matching error: ${error}` }, 500)
  }
})

// Ruta para obtener feed de posts
app.get('/make-server-34f10c60/feed', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '0')
    const limit = parseInt(c.req.query('limit') || '10')

    // Generar posts dinámicos basados en misiones y usuarios
    const users = await kv.getByPrefix('user:')
    const missions = await kv.getByPrefix('mission:')

    const posts = []
    let postId = page * limit

    for (let i = 0; i < limit && i < users.length * 3; i++) {
      const user = users[i % users.length]
      const mission = missions[i % missions.length]
      
      const post = {
        id: `post-${postId++}`,
        author: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          goodnessLevel: user.goodnessLevel,
          location: user.location.address
        },
        content: i % 3 === 0 
          ? `¡Nueva misión disponible: ${mission?.title}! Únete para hacer la diferencia.`
          : i % 3 === 1
          ? `¡Logré completar otra misión! Mi nivel de bondad subió a ${user.goodnessLevel}.`
          : 'Compartiendo mi experiencia en esta increíble comunidad. ¡Cada acción cuenta!',
        type: i % 3 === 0 ? 'mission' : i % 3 === 1 ? 'achievement' : 'story',
        likes: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 50) + 1,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        missionReward: i % 3 === 0 ? mission?.reward : undefined
      }
      
      posts.push(post)
    }

    // Ordenar por timestamp
    posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return c.json({
      success: true,
      posts,
      hasMore: true
    })
  } catch (error) {
    console.log('Feed fetch error:', error)
    return c.json({ error: `Feed fetch error: ${error}` }, 500)
  }
})

// Ruta para el chat bot
app.post('/make-server-34f10c60/chat', async (c) => {
  try {
    const { message, userId } = await c.req.json()

    if (!message) {
      return c.json({ error: 'Message is required' }, 400)
    }

    // Generar respuesta del bot basada en el contenido
    const lowerMessage = message.toLowerCase()
    let botResponse = ''
    let suggestions = []

    if (lowerMessage.includes('misión') || lowerMessage.includes('trabajo') || lowerMessage.includes('cerca')) {
      const missions = await kv.getByPrefix('mission:')
      const activeMissions = missions.filter(m => m.status === 'active').slice(0, 3)
      
      botResponse = `He encontrado ${activeMissions.length} misiones cerca de ti:\n\n`
      activeMissions.forEach(mission => {
        botResponse += `📍 **${mission.title}** - ${mission.reward} puntos\n`
        botResponse += `   ${mission.location.address}\n\n`
      })
      
      suggestions = ['Ver detalles de misión', '¿Cómo unirme?', 'Misiones por categoría']
    } else if (lowerMessage.includes('impacto') || lowerMessage.includes('nivel') || lowerMessage.includes('estadística')) {
      const userData = userId ? await kv.get(`user:${userId}`) : null
      
      if (userData) {
        botResponse = `¡Tu impacto es increíble, ${userData.name}!\n\n📊 **Tu Resumen:**\n⭐ Nivel de Bondad: ${userData.goodnessLevel}\n🎯 Misiones: ${userData.totalMissions}\n👥 Personas Ayudadas: ${userData.helpedPeople}\n🌍 CO2 Ahorrado: ${userData.carbonSaved}t\n🔥 Racha: ${userData.streak} días`
      } else {
        botResponse = 'Para ver tu impacto personalizado, necesitas iniciar sesión. ¡Pero puedo contarte sobre el impacto global de nuestra comunidad!'
      }
      
      suggestions = ['Ver ranking global', 'Consejos para mejorar', 'Próximos logros']
    } else if (lowerMessage.includes('clima') || lowerMessage.includes('calentamiento')) {
      botResponse = `🌡️ **Estado del Clima Global:**\n\n⏰ Tiempo para limitar a 1.5°C: ~5 años\n📈 Temperatura actual: +1.1°C vs pre-industrial\n🎯 Meta: Mantener bajo +1.5°C\n\n¡Tu participación es crucial para el cambio!`
      suggestions = ['Misiones climáticas', 'Calcular mi huella', 'Tips ecológicos']
    } else {
      botResponse = `¡Hola! Soy EcoBot 🤖🌱\n\nEstoy aquí para ayudarte con:\n🎯 Encontrar misiones perfectas\n📊 Revisar tu impacto\n💡 Darte consejos personalizados\n🌍 Info sobre cambio climático\n\n¿En qué puedo ayudarte?`
      suggestions = ['Encuentra misiones', '¿Cuál es mi impacto?', 'Consejos para mejorar']
    }

    // Guardar conversación si hay userId
    if (userId) {
      const conversationKey = `chat:${userId}:${Date.now()}`
      await kv.set(conversationKey, {
        userMessage: message,
        botResponse,
        timestamp: new Date().toISOString()
      })
    }

    return c.json({
      success: true,
      response: botResponse,
      suggestions
    })
  } catch (error) {
    console.log('Chat error:', error)
    return c.json({ error: `Chat error: ${error}` }, 500)
  }
})

// Inicializar datos al arrancar el servidor
initializeBuckets()
initializeData()

Deno.serve(app.fetch)