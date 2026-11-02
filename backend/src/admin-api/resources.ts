import { sanitizeRichText } from '../common/sanitize';
import { crudController } from './crud';
import * as d from './dto';

/**
 * One line of configuration per content type. Each becomes a full admin controller at /api/admin/<path>
 * (list, get, create, update, delete, reorder). See crud.ts for what the options mean.
 * The Angular admin screens map 1:1 to these resources.
 */
const seoNullable = ['metaTitle', 'metaDescription'];

/** Date fields arrive as "2026-02-15" or full ISO strings; Prisma wants Date objects. */
const dates = (...fields: string[]) => (data: any) => {
  for (const f of fields) if (typeof data[f] === 'string' && data[f]) data[f] = new Date(data[f]);
  return data;
};

export const SocialLinksController = crudController({
  path: 'social-links', model: 'socialLink', createDto: d.SocialLinkDto, updateDto: d.UpdateSocialLinkDto, sortable: true,
});

export const MenuItemsController = crudController({
  path: 'menu-items', model: 'menuItem', createDto: d.MenuItemDto, updateDto: d.UpdateMenuItemDto, sortable: true,
  filters: ['location'], orderBy: [{ location: 'asc' }, { sortOrder: 'asc' }],
});

// Fixed pages: edit title, SEO and the CTA flag only (their URLs are part of the site's structure).
export const PagesController = crudController({
  path: 'pages', model: 'page', updateDto: d.UpdatePageDto, allowDelete: false, include: { ogImage: true },
  nullable: seoNullable, orderBy: { id: 'asc' }, viewUrl: (r) => (r.slug ? `/${r.slug}` : '/'),
});

// Every one-off text/image on a page. Filter with ?pageKey=about. Rich-text blocks are sanitised on save.
export const ContentBlocksController = crudController({
  path: 'content-blocks', model: 'contentBlock', updateDto: d.UpdateBlockDto, allowDelete: false,
  include: { media: true }, filters: ['pageKey'], orderBy: [{ pageKey: 'asc' }, { sortOrder: 'asc' }],
  beforeSave: (data, existing) => {
    if (existing?.type === 'RICHTEXT' && typeof data.value === 'string') data.value = sanitizeRichText(data.value);
    return data;
  },
});

export const StatsController = crudController({
  path: 'stats', model: 'stat', createDto: d.StatDto, updateDto: d.UpdateStatDto, sortable: true,
  filters: ['group'], orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
});

export const FeatureItemsController = crudController({
  path: 'feature-items', model: 'featureItem', createDto: d.FeatureItemDto, updateDto: d.UpdateFeatureItemDto, sortable: true,
  filters: ['group'], orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
});

export const FaqsController = crudController({
  path: 'faqs', model: 'faq', createDto: d.FaqDto, updateDto: d.UpdateFaqDto, sortable: true, filters: ['pageKey'],
});

export const IndustriesController = crudController({
  path: 'industries', model: 'industry', createDto: d.IndustryDto, updateDto: d.UpdateIndustryDto, sortable: true,
});

export const LocationsController = crudController({
  path: 'locations', model: 'location', createDto: d.LocationDto, updateDto: d.UpdateLocationDto, sortable: true,
});

export const TeamMembersController = crudController({
  path: 'team-members', model: 'teamMember', createDto: d.TeamMemberDto, updateDto: d.UpdateTeamMemberDto, sortable: true,
  include: { photo: true },
});

export const ServiceCategoriesController = crudController({
  path: 'service-categories', model: 'serviceCategory', createDto: d.ServiceCategoryDto, updateDto: d.UpdateServiceCategoryDto,
  sortable: true, slugFrom: 'title', filters: ['status'],
});

export const ServicesController = crudController({
  path: 'services', model: 'service', createDto: d.ServiceDto, updateDto: d.UpdateServiceDto, sortable: true,
  include: { category: true, ogImage: true }, filters: ['categoryId', 'status'], slugFrom: 'title', sanitize: ['body'],
  nullable: [...seoNullable, 'menuLabel'], orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
});

export const PostCategoriesController = crudController({
  path: 'post-categories', model: 'postCategory', createDto: d.PostCategoryDto, updateDto: d.UpdatePostCategoryDto,
  sortable: true, slugFrom: 'name',
});

export const PostsController = crudController({
  path: 'posts', model: 'post', createDto: d.PostDto, updateDto: d.UpdatePostDto, sortable: true,
  include: { category: true, cover: true, ogImage: true }, filters: ['categoryId', 'status'], slugFrom: 'title',
  sanitize: ['body'], nullable: seoNullable, orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
  viewUrl: (r) => `/learning/${r.slug}`, beforeSave: dates('publishedAt'),
});

export const DepartmentsController = crudController({
  path: 'departments', model: 'department', createDto: d.DepartmentDto, updateDto: d.UpdateDepartmentDto, sortable: true,
});

export const JobsController = crudController({
  path: 'jobs', model: 'job', createDto: d.JobDto, updateDto: d.UpdateJobDto, sortable: true,
  include: { department: true, ogImage: true }, filters: ['departmentId', 'status'], slugFrom: 'title',
  sanitize: ['description', 'requirements'], nullable: [...seoNullable, 'salary', 'applyEmail', 'closingDate'],
  orderBy: [{ postedAt: 'desc' }, { id: 'desc' }], beforeSave: dates('postedAt', 'closingDate'),
  viewUrl: (r) => `/careers/${r.slug}`,
});

export const resourceControllers = [
  SocialLinksController, MenuItemsController, PagesController, ContentBlocksController, StatsController,
  FeatureItemsController, FaqsController, IndustriesController, LocationsController, TeamMembersController,
  ServiceCategoriesController, ServicesController, PostCategoriesController, PostsController,
  DepartmentsController, JobsController,
];
