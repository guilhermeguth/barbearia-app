import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Configuração do storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/barbers')
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    
    cb(null, uploadPath)
  },
  filename: (_req, file, cb) => {
    // Gerar nome único: barbeiro_timestamp.extensao
    const uniqueName = `barbeiro_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

// Filtro para validar tipos de arquivo
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceitar apenas imagens
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use apenas: JPEG, PNG, GIF ou WebP'))
  }
}

// Configuração do multer
export const uploadBarberPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1 // Apenas 1 arquivo por vez
  }
})

// Função para deletar arquivo antigo
export const deleteBarberPhoto = (photoPath: string): void => {
  if (!photoPath) return
  
  try {
    // Extrair apenas o nome do arquivo se for uma URL completa
    const fileName = photoPath.includes('/') ? path.basename(photoPath) : photoPath
    const fullPath = path.join(__dirname, '../../uploads/barbers', fileName)
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
      console.log(`📸 Foto excluída: ${fileName}`)
    }
  } catch (error) {
    console.error('Erro ao excluir foto:', error)
  }
}

// Função para gerar URL da foto
export const getPhotoUrl = (fileName: string | null, req: any): string | null => {
  if (!fileName) return null
  
  // Se já for uma URL completa, retornar como está
  if (fileName.startsWith('http')) return fileName
  
  // Gerar URL baseada no host da requisição
  const baseUrl = `${req.protocol}://${req.get('host')}`
  return `${baseUrl}/uploads/barbers/${fileName}`
}
