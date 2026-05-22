import { Router } from 'express'
import {
  create,
  update,
  remove,
  reorder,
  getSections,
} from '../controllers/section.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import {
  createSectionValidator,
  updateSectionValidator,
  reorderSectionsValidator,
} from '../validators/section.validators.js'
import validateRequest from '../middleware/validateRequest.js'

const router = Router({ mergeParams: true })

router.get('/', getSections)

router.use(protect, authorize('instructor', 'admin'))

router.post('/', createSectionValidator, validateRequest, create)
router.put('/reorder', reorderSectionsValidator, validateRequest, reorder)
router.put('/:sectionId', updateSectionValidator, validateRequest, update)
router.delete('/:sectionId', remove)

export default router