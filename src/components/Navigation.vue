<!--
  - Copyright (c) 2020. The Nextcloud Bookmarks contributors.
  -
  - This file is licensed under the Affero General Public License version 3 or later. See the COPYING file.
  -->

<template>
	<AppNavigation class="navigation">
		<template #list>
			<AppNavigationItem key="menu-home"
				:to="{ name: routes.HOME }"
				icon="icon-home"
				:title="t('bookmarks', 'All bookmarks')"
				:exact="true">
				<AppNavigationCounter slot="counter">
					{{ allBookmarksCount | largeNumbers }}
				</AppNavigationCounter>
			</AppNavigationItem>
			<AppNavigationItem key="menu-recent"
				:to="{ name: routes.RECENT }"
				:title="t('bookmarks', 'Recent')">
				<HistoryIcon slot="icon" :size="18" :fill-color="colorMainText" />
			</AppNavigationItem>
			<AppNavigationItem
				key="menu-shared-folders"
				:to="{ name: routes.SHARED_FOLDERS }"
				:title="t('bookmarks', 'Shared with you')">
				<ShareVariantIcon slot="icon" :size="18" :fill-color="colorMainText" />
				<AppNavigationCounter v-show="Boolean(sharedFoldersCount)" slot="counter">
					{{ sharedFoldersCount | largeNumbers }}
				</AppNavigationCounter>
			</AppNavigationItem>
			<AppNavigationItem
				key="menu-archived"
				:to="{ name: routes.ARCHIVED }"
				:title="t('bookmarks', 'Files')">
				<FileDocumentMultipleIcon slot="icon"
					:size="18"
					:fill-color="colorMainText" />
				<AppNavigationCounter v-show="Boolean(archivedBookmarksCount)" slot="counter">
					{{ archivedBookmarksCount }}
				</AppNavigationCounter>
			</AppNavigationItem>
			<AppNavigationItem
				key="menu-duplicated"
				:to="{ name: routes.DUPLICATED }"
				:title="t('bookmarks', 'Duplicates')">
				<VectorLinkIcon slot="icon" :size="18" :fill-color="colorMainText" />
				<AppNavigationCounter v-show="Boolean(duplicatedBookmarksCount)" slot="counter">
					{{ duplicatedBookmarksCount | largeNumbers }}
				</AppNavigationCounter>
			</AppNavigationItem>
			<AppNavigationItem
				key="menu-unavailable"
				:to="{ name: routes.UNAVAILABLE }"
				:title="t('bookmarks', 'Broken links')">
				<LinkVariantOffIcon slot="icon" :size="18" :fill-color="colorMainText" />
				<AppNavigationCounter v-show="Boolean(unavailableBookmarksCount)" slot="counter">
					{{ unavailableBookmarksCount | largeNumbers }}
				</AppNavigationCounter>
			</AppNavigationItem>
			<AppNavigationSpacer />
			<AppNavigationNewItem key="menu-new-tag"
				:title="t('bookmarks', 'New tag')"
				@new-item="onNewTag">
				<TagPlusIcon slot="icon" :size="18" :fill-color="colorMainText" />
			</AppNavigationNewItem>
			<template v-if="Boolean(tags.length)">
				<AppNavigationItem key="menu-tags"
					:title="t('bookmarks', 'Search tags')"
					@click="onSearchTags">
					<TagMultipleIcon slot="icon" :size="18" :fill-color="colorMainText" />
				</AppNavigationItem>
				<AppNavigationItem v-for="tag in tags"
					:key="'tag-'+tag.name"
					v-drop-target="{allow: (e) => allowDropOnTag(tag.name, e), drop: (e) => onDropOnTag(tag.name, e)}"
					icon="icon-tag"
					:to="tag.route"
					:force-menu="true"
					:edit-label="t('bookmarks', 'Rename')"
					:editable="!isPublic"
					:title="tag.name"
					@update:title="onRenameTag(tag.name, $event)">
					<AppNavigationCounter slot="counter">
						{{ tag.count | largeNumbers }}
					</AppNavigationCounter>
					<template v-if="!isPublic" slot="actions">
						<ActionButton icon="icon-delete" :close-after-click="true" @click="onDeleteTag(tag.name)">
							{{ t('bookmarks', 'Delete') }}
						</ActionButton>
					</template>
				</AppNavigationItem>
				<AppNavigationItem key="menu-untagged"
					:to="{ name: routes.UNTAGGED }"
					:title="t('bookmarks', 'Untagged')">
					<TagOffIcon slot="icon" :size="18" :fill-color="colorMainText" />
				</AppNavigationItem>
			</template>
			<template v-if="Number(bookmarksLimit) > 0">
				<AppNavigationSpacer />
				<AppNavigationItem :pinned="true" icon="icon-quota" :title="t('bookmarks', '{used} bookmarks of {available} available', {used: allBookmarksCount, available: bookmarksLimit})">
					<ProgressBar :val="allBookmarksCount" :max="bookmarksLimit" />
				</AppNavigationItem>
			</template>
		</template>
		<template #footer>
			<AppNavigationSettings v-if="!isPublic">
				<Settings />
			</AppNavigationSettings>
		</template>
	</AppNavigation>
</template>

<script>
import AppNavigation from '@nextcloud/vue/dist/Components/AppNavigation'
import AppNavigationItem from '@nextcloud/vue/dist/Components/AppNavigationItem'
import AppNavigationNewItem from '@nextcloud/vue/dist/Components/AppNavigationNewItem'
import AppNavigationCounter from '@nextcloud/vue/dist/Components/AppNavigationCounter'
import AppNavigationSettings from '@nextcloud/vue/dist/Components/AppNavigationSettings'
import AppNavigationSpacer from '@nextcloud/vue/dist/Components/AppNavigationSpacer'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import HistoryIcon from 'vue-material-design-icons/History'
import TagOffIcon from 'vue-material-design-icons/TagOff'
import LinkVariantOffIcon from 'vue-material-design-icons/LinkVariantOff'
import ShareVariantIcon from 'vue-material-design-icons/ShareVariant'
import FileDocumentMultipleIcon from 'vue-material-design-icons/FileDocumentMultiple'
import TagPlusIcon from 'vue-material-design-icons/TagPlus'
import TagMultipleIcon from 'vue-material-design-icons/TagMultiple'
import VectorLinkIcon from 'vue-material-design-icons/VectorLink'
import ProgressBar from 'vue-simple-progress'
import Settings from './Settings'
import { actions, mutations } from '../store/'

export default {
	name: 'Navigation',
	components: {
		AppNavigation,
		AppNavigationItem,
		AppNavigationNewItem,
		AppNavigationCounter,
		AppNavigationSettings,
		AppNavigationSpacer,
		ActionButton,
		Settings,
		ProgressBar,
		HistoryIcon,
		TagOffIcon,
		LinkVariantOffIcon,
		TagPlusIcon,
		TagMultipleIcon,
		FileDocumentMultipleIcon,
		ShareVariantIcon,
		VectorLinkIcon,
	},

	filters: {
		largeNumbers(num) {
			return num >= 1000 ? (Math.round(num / 100) / 10) + 'K' : num
		},
	},
	data() {
		return {}
	},
	computed: {
		tags() {
			return this.$store.state.tags.map(tag => ({
				route: { name: this.routes.TAGS, params: { tags: tag.name } },
				name: tag.name,
				count: tag.count,
			}))
		},
		allBookmarksCount() {
			return this.$store.state.countsByFolder[-1]
		},
		unavailableBookmarksCount() {
			return this.$store.state.unavailableCount
		},
		sharedFoldersCount() {
			return Object.keys(this.$store.state.sharedFoldersById).length
		},
		archivedBookmarksCount() {
			return this.$store.state.archivedCount
		},
		duplicatedBookmarksCount() {
			return this.$store.state.duplicatedCount
		},
		bookmarksLimit() {
			return this.$store.state.settings.limit
		},
	},

	created() {
	},

	methods: {
		onSearchTags() {
			this.$router.push({ name: this.routes.TAGS })
		},
		onDeleteTag(tag) {
			this.$store.dispatch(actions.DELETE_TAG, tag)
		},
		onRenameTag(oldName, newName) {
			this.$store.dispatch(actions.RENAME_TAG, { oldName, newName })
		},
		onNewTag(tagName) {
			this.$store.commit(mutations.ADD_TAG, tagName)
		},
		allowDropOnTag(tagName) {
			return !this.$store.state.selection.folders.length && this.$store.state.selection.bookmarks.length
		},
		onDropOnTag(tagName) {
			this.$store.dispatch(actions.TAG_SELECTION, { tags: [tagName], originalTags: [] })
		},
	},
}
</script>
<style>

.navigation .dropTarget--available {
	background: var(--color-primary-light);
}

.navigation .dropTarget--active {
	background: var(--color-primary-element-light);
}
</style>
