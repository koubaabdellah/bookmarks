/*
 * Copyright (c) 2020. The Nextcloud Bookmarks contributors.
 *
 * This file is licensed under the Affero General Public License version 3 or later. See the COPYING file.
 */

import Vue from 'vue'
import axios from '@nextcloud/axios'
import { findFolder } from './findFolder'

export const mutations = {
	SET_AUTH_TOKEN: 'SET_AUTH_TOKEN',
	DISPLAY_NEW_BOOKMARK: 'DISPLAY_NEW_BOOKMARK',
	DISPLAY_NEW_FOLDER: 'DISPLAY_NEW_FOLDER',
	DISPLAY_MOVE_DIALOG: 'DISPLAY_MOVE_DIALOG',
	DISPLAY_COPY_DIALOG: 'DISPLAY_COPY_DIALOG',
	RESET_SELECTION: 'RESET_SELECTION',
	REMOVE_SELECTION_BOOKMARK: 'REMOVE_SELECTION_BOOKMARK',
	ADD_SELECTION_BOOKMARK: 'ADD_SELECTION_BOOKMARK',
	REMOVE_SELECTION_FOLDER: 'REMOVE_SELECTION_FOLDER',
	ADD_SELECTION_FOLDER: 'ADD_SELECTION_FOLDER',
	ADD_BOOKMARK: 'ADD_BOOKMARK',
	REMOVE_BOOKMARK: 'REMOVE_BOOKMARK',
	REMOVE_ALL_BOOKMARKS: 'REMOVE_ALL_BOOKMARKS',
	SORT_BOOKMARKS: 'SORT_BOOKMARKS',
	SET_BOOKMARK_COUNT: 'SET_BOOKMARK_COUNT',
	SET_UNAVAILABLE_COUNT: 'SET_UNAVAILABLE_COUNT',
	SET_ARCHIVED_COUNT: 'SET_ARCHIVED_COUNT',
	SET_DUPLICATED_COUNT: 'SET_DUPLICATED_COUNT',
	ADD_TAG: 'ADD_TAG',
	SET_TAGS: 'SET_TAGS',
	RENAME_TAG: 'RENAME_TAG',
	REMOVE_TAG: 'REMOVE_TAG',
	INCREMENT_PAGE: 'INCREMENT_PAGE',
	RESET_PAGE: 'RESET_PAGE',
	SET_QUERY: 'SET_QUERY',
	SET_SORTBY: 'SET_SORTBY',
	FETCH_START: 'FETCH_START',
	FETCH_END: 'FETCH_END',
	REACHED_END: 'REACHED_END',
	SET_ERROR: 'SET_ERROR',
	SET_NOTIFICATION: 'SET_NOTIFICATION',
	SET_FOLDERS: 'SET_FOLDERS',
	MOVE_FOLDER: 'MOVE_FOLDER',
	SET_SIDEBAR: 'SET_SIDEBAR',
	SET_SETTING: 'SET_SETTING',
	SET_VIEW_MODE: 'SET_VIEW_MODE',
	ADD_SHARE: 'ADD_SHARE',
	ADD_SHARED_FOLDER: 'ADD_SHARED_FOLDER',
	REMOVE_SHARE: 'REMOVE_SHARE',
	ADD_PUBLIC_TOKEN: 'ADD_PUBLIC_TOKEN',
	REMOVE_PUBLIC_TOKEN: 'REMOVE_PUBLIC_TOKEN',
	SET_FOLDER_CHILDREN_ORDER: 'SET_FOLDER_CHILDREN_ORDER',
}
export default {
	[mutations.SET_AUTH_TOKEN](state, authToken) {
		if (authToken) {
			state.public = true
		}
		state.authToken = authToken
		axios.defaults.headers = {
			requesttoken: OC.requesttoken,
			Authorization: 'bearer ' + authToken,
		}
	},
	[mutations.SET_VIEW_MODE](state, viewMode) {
		state.viewMode = viewMode
	},
	[mutations.SET_ERROR](state, error) {
		state.error = error
	},
	[mutations.SET_NOTIFICATION](state, msg) {
		state.notification = msg
	},
	[mutations.SET_SETTING](state, { key, value }) {
		Vue.set(state.settings, key, value)
	},
	[mutations.SET_FOLDERS](state, folders) {
		state.folders = sortFolders(folders)
	},
	[mutations.MOVE_FOLDER](state, { folder, target }) {
		const currentFolder = findFolder(folder, state.folders)[0]
		const oldParent = findFolder(currentFolder.parent_folder, state.folders)[0]
		const index = oldParent.children.indexOf(currentFolder)
		oldParent.children.splice(index, 1)
		const newParent = findFolder(target, state.folders)[0]
		newParent.children.push(currentFolder)

		if (state.childrenByFolder[oldParent.id]) {
			const index = state.childrenByFolder[oldParent.id].findIndex(item => item.id === currentFolder.id)
			state.childrenByFolder[oldParent.id].splice(index, 1)
		}
		if (state.childrenByFolder[newParent.id]) {
			state.childrenByFolder[newParent.id].push({ type: 'folder', id: currentFolder.id })
		}
	},
	[mutations.ADD_TAG](state, tag) {
		state.tags.push({ name: tag, count: 0 })
	},
	[mutations.SET_TAGS](state, tags) {
		state.tags = tags
	},
	[mutations.RENAME_TAG](state, { oldName, newName }) {
		state.bookmarks.forEach((bookmark) => {
			Vue.set(bookmark, 'tags', bookmark.tags.map((tag) => {
				if (tag === oldName) return newName
				return tag
			}))
		})
	},
	[mutations.REMOVE_TAG](state, oldTag) {
		state.bookmarks.forEach((bookmark) => {
			Vue.set(bookmark, 'tags', bookmark.tags.filter((tag) => {
				return tag !== oldTag
			}))
		})
	},
	[mutations.DISPLAY_NEW_BOOKMARK](state, display) {
		state.displayNewBookmark = display
		if (display) {
			state.displayNewFolder = false
		}
	},
	[mutations.DISPLAY_NEW_FOLDER](state, display) {
		state.displayNewFolder = display
		if (display) {
			state.displayNewBookmark = false
		}
	},
	[mutations.DISPLAY_MOVE_DIALOG](state, display) {
		state.displayMoveDialog = display
	},

	[mutations.DISPLAY_COPY_DIALOG](state, display) {
		state.displayCopyDialog = display
	},

	[mutations.RESET_SELECTION](state) {
		state.selection = { folders: [], bookmarks: [] }
	},
	[mutations.ADD_SELECTION_BOOKMARK](state, item) {
		if (state.selection.bookmarks.find(b => item.id === b.id)) {
			return
		}
		state.selection.bookmarks.push(item)
	},
	[mutations.REMOVE_SELECTION_BOOKMARK](state, item) {
		Vue.set(
			state.selection,
			'bookmarks',
			state.selection.bookmarks.filter(s => !(s.id === item.id))
		)
	},
	[mutations.ADD_SELECTION_FOLDER](state, item) {
		state.selection.folders.push(item)
	},
	[mutations.REMOVE_SELECTION_FOLDER](state, item) {
		Vue.set(
			state.selection,
			'folders',
			state.selection.folders.filter(s => !(s.id === item.id))
		)
	},

	[mutations.ADD_BOOKMARK](state, bookmark) {
		const existingBookmark = state.bookmarksById[bookmark.id]
		if (!existingBookmark) {
			state.bookmarks.push(bookmark)
			Vue.set(state.bookmarksById, bookmark.id, bookmark)
		}
	},
	[mutations.REMOVE_BOOKMARK](state, id) {
		const index = state.bookmarks.findIndex(bookmark => bookmark.id === id)
		if (index !== -1) {
			const bookmark = state.bookmarks[index]
			bookmark.folders.forEach(folderId => {
				if (!state.childrenByFolder[folderId]) {
					return
				}
				const index = state.childrenByFolder[folderId].findIndex(bookmark => bookmark.id === id)
				if (index !== -1) {
					return
				}
				state.childrenByFolder[folderId].splice(index, 1)
			})
			state.bookmarks.splice(index, 1)
			Vue.delete(state.bookmarksById, id)
		}
	},
	[mutations.REMOVE_ALL_BOOKMARKS](state) {
		state.bookmarks = []
		state.bookmarksById = {}
	},
	[mutations.SORT_BOOKMARKS](state, column) {
		state.bookmarks.sort((a, b) => b[column] - a[column])
	},
	[mutations.SET_BOOKMARK_COUNT](state, { folderId, count }) {
		Vue.set(state.countsByFolder, folderId, count)
	},
	[mutations.SET_UNAVAILABLE_COUNT](state, count) {
		state.unavailableCount = count
	},
	[mutations.SET_ARCHIVED_COUNT](state, count) {
		state.archivedCount = count
	},
	[mutations.SET_DUPLICATED_COUNT](state, count) {
		state.duplicatedCount = count
	},

	[mutations.SET_SIDEBAR](state, sidebar) {
		state.sidebar = sidebar
	},

	[mutations.INCREMENT_PAGE](state) {
		Vue.set(state.fetchState, 'page', state.fetchState.page + 1)
	},
	[mutations.RESET_PAGE](state) {
		state.bookmarks = []
		state.bookmarksById = {}
		Vue.set(state.fetchState, 'page', 0)
		Vue.set(state.fetchState, 'reachedEnd', false)
	},
	[mutations.SET_QUERY](state, query) {
		if (JSON.stringify(query) !== JSON.stringify(state.fetchState.query)) {
			// when the query doesn't change, we're likely reloading the view, which looks better
			// when we don't remove bookmarks until the new set is loaded
			// FETCH_PAGE will remove bookmarks upon retrieving the new set when page === 0
			state.bookmarks = []
			state.bookmarksById = {}
		}
		Vue.set(state.fetchState, 'page', 0)
		Vue.set(state.fetchState, 'reachedEnd', false)
		Vue.set(state.fetchState, 'query', query)

		// cancel currently running request
		if (typeof state.loading.bookmarks === 'function') {
			state.loading.bookmarks()
		}
		// stop loading
		Vue.set(state.loading, 'bookmarks', false)
	},
	[mutations.FETCH_START](state, event) {
		if (typeof state.loading[event.type] === 'function') {
			state.loading[event.type]()
		}
		Vue.set(state.loading, event.type, event.cancel || true)
	},
	[mutations.FETCH_END](state, type) {
		Vue.set(state.loading, type, false)
	},

	[mutations.REACHED_END](state) {
		Vue.set(state.fetchState, 'reachedEnd', true)
	},

	[mutations.ADD_SHARED_FOLDER](state, folder) {
		Vue.set(state.sharedFoldersById, folder.id, folder)
	},

	[mutations.ADD_SHARE](state, share) {
		Vue.set(state.sharesById, share.id, share)
	},
	[mutations.REMOVE_SHARE](state, id) {
		if (!state.sharesById[id]) {
			return
		}
		Vue.delete(state.sharesById, id)
	},

	[mutations.ADD_PUBLIC_TOKEN](state, { folderId, token }) {
		Vue.set(state.tokensByFolder, folderId, token)
	},
	[mutations.REMOVE_PUBLIC_TOKEN](state, { folderId }) {
		Vue.delete(state.tokensByFolder, folderId)
	},
	[mutations.SET_FOLDER_CHILDREN_ORDER](state, { folderId, children }) {
		Vue.set(state.childrenByFolder, folderId, children)
	},
}

/**
 * @param folders
 */
function sortFolders(folders) {
	folders.forEach(folder => {
		folder.children = sortFolders(folder.children)
	})
	return folders.sort((a, b) => (a.title > b.title ? 1 : -1))
}
