// 51talk 用户访谈会后台管理系统
document.addEventListener('DOMContentLoaded', function() {

    // 数据管理类
    class DataManager {
        constructor() {
            this.allData = [];
            this.filteredData = [];
            this.currentPage = 1;
            this.pageSize = 10;
            this.sortField = '';
            this.sortDirection = 'asc';
            this.filters = {
                search: '',
                timeSlot: '',
                dateRange: ''
            };
        }

        // 模拟数据 - 实际使用时从后端API获取
        loadMockData() {
            const mockData = [
                { id: 1, user_name: '王女士', selected_slot: 'AM', submit_time: '2025-11-19 09:30:00', ip_address: '192.168.1.100' },
                { id: 2, user_name: '李先生', selected_slot: 'PM', submit_time: '2025-11-19 10:15:00', ip_address: '192.168.1.101' },
                { id: 3, user_name: '张妈妈', selected_slot: 'AM', submit_time: '2025-11-19 11:20:00', ip_address: '192.168.1.102' },
                { id: 4, user_name: '刘爸爸', selected_slot: 'PM', submit_time: '2025-11-19 14:30:00', ip_address: '192.168.1.103' },
                { id: 5, user_name: '陈女士', selected_slot: 'AM', submit_time: '2025-11-19 15:45:00', ip_address: '192.168.1.104' },
                { id: 6, user_name: '赵先生', selected_slot: 'PM', submit_time: '2025-11-18 09:00:00', ip_address: '192.168.1.105' },
                { id: 7, user_name: '孙妈妈', selected_slot: 'AM', submit_time: '2025-11-18 10:30:00', ip_address: '192.168.1.106' },
                { id: 8, user_name: '周爸爸', selected_slot: 'PM', submit_time: '2025-11-18 13:15:00', ip_address: '192.168.1.107' }
            ];

            // 从本地存储获取实际数据（如果有）
            const localStorageData = this.getFromLocalStorage();

            if (localStorageData.length > 0) {
                this.allData = localStorageData;
            } else {
                this.allData = mockData;
            }

            this.applyFilters();
            return this.allData;
        }

        // 从本地存储获取数据
        getFromLocalStorage() {
            try {
                const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
                return registrations.map((item, index) => ({
                    id: index + 1,
                    user_name: item.user_name || '',
                    selected_slot: item.selected_slot || '',
                    submit_time: item.timestamp ? new Date(item.timestamp).toLocaleString('zh-CN') : '',
                    ip_address: item.ip_address || ''
                })).filter(item => item.user_name);
            } catch (error) {
                console.error('读取本地存储失败:', error);
                return [];
            }
        }

        // 从API获取数据
        async fetchData() {
            try {
                showLoading(true);

                // 实际部署时替换为真实的API调用
                // const response = await fetch('https://your-api-endpoint.com/api/registrations');
                // const data = await response.json();

                // 模拟API调用延迟
                await new Promise(resolve => setTimeout(resolve, 1000));

                // 使用模拟数据
                const data = this.loadMockData();

                return data;

            } catch (error) {
                console.error('获取数据失败:', error);
                throw error;
            } finally {
                showLoading(false);
            }
        }

        // 应用筛选条件
        applyFilters() {
            let filtered = [...this.allData];

            // 搜索筛选
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                filtered = filtered.filter(item =>
                    item.user_name.toLowerCase().includes(searchTerm)
                );
            }

            // 时间段筛选
            if (this.filters.timeSlot) {
                filtered = filtered.filter(item => item.selected_slot === this.filters.timeSlot);
            }

            // 日期筛选
            if (this.filters.dateRange) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                filtered = filtered.filter(item => {
                    const itemDate = new Date(item.submit_time);

                    switch (this.filters.dateRange) {
                        case 'today':
                            return itemDate >= today;
                        case 'yesterday':
                            const yesterday = new Date(today);
                            yesterday.setDate(yesterday.getDate() - 1);
                            return itemDate >= yesterday && itemDate < today;
                        case 'week':
                            const weekAgo = new Date(today);
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return itemDate >= weekAgo;
                        default:
                            return true;
                    }
                });
            }

            this.filteredData = filtered;
        }

        // 排序数据
        sortData(field) {
            if (this.sortField === field) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortField = field;
                this.sortDirection = 'asc';
            }

            this.filteredData.sort((a, b) => {
                let aVal = a[field];
                let bVal = b[field];

                // 处理时间字段
                if (field === 'submit_time') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }

                // 处理数字字段
                if (field === 'id') {
                    aVal = parseInt(aVal);
                    bVal = parseInt(bVal);
                }

                let comparison = 0;
                if (aVal > bVal) comparison = 1;
                if (aVal < bVal) comparison = -1;

                return this.sortDirection === 'asc' ? comparison : -comparison;
            });
        }

        // 获取当前页数据
        getCurrentPageData() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.filteredData.slice(start, end);
        }

        // 获取统计信息
        getStatistics() {
            const total = this.allData.length;
            const amCount = this.allData.filter(item => item.selected_slot === 'AM').length;
            const pmCount = this.allData.filter(item => item.selected_slot === 'PM').length;

            return { total, amCount, pmCount };
        }
    }

    // 统计图表类
    class StatisticsChart {
        constructor(dataManager) {
            this.dataManager = dataManager;
            this.canvas = document.getElementById('statsChart');
            this.ctx = this.canvas.getContext('2d');
            this.maxCapacity = 20; // 每场最大容量
        }

        // 绘制饼图
        drawPieChart(amCount, pmCount) {
            const total = amCount + pmCount;
            if (total === 0) {
                this.drawEmptyChart();
                return;
            }

            const canvas = this.canvas;
            const ctx = this.ctx;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 20;

            // 清除画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 计算角度
            const amAngle = (amCount / total) * 2 * Math.PI;
            const pmAngle = (pmCount / total) * 2 * Math.PI;

            // 绘制上午场扇形
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI/2, -Math.PI/2 + amAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = '#1976d2';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制下午场扇形
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI/2 + amAngle, -Math.PI/2 + amAngle + pmAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = '#f57c00';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制中心圆（甜甜圈效果）
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();

            // 在中心显示总数
            ctx.fillStyle = '#333';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(total, centerX, centerY - 8);

            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#666';
            ctx.fillText('总报名', centerX, centerY + 12);

            // 更新图例数据
            document.getElementById('amLegendCount').textContent = amCount;
            document.getElementById('pmLegendCount').textContent = pmCount;
        }

        // 绘制空图表
        drawEmptyChart() {
            const canvas = this.canvas;
            const ctx = this.ctx;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 20;

            // 清除画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制灰色圆环
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 30;
            ctx.stroke();

            // 绘制中心圆
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();

            // 显示0
            ctx.fillStyle = '#999';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('0', centerX, centerY);

            // 更新图例数据
            document.getElementById('amLegendCount').textContent = '0';
            document.getElementById('pmLegendCount').textContent = '0';
        }

        // 更新统计信息
        updateStatistics() {
            const stats = this.dataManager.getStatistics();

            // 绘制图表
            this.drawPieChart(stats.amCount, stats.pmCount);

            // 计算参与率（假设每场最大20人）
            const totalCapacity = this.maxCapacity * 2; // 上午场和下午场总容量
            const participationRate = totalCapacity > 0 ? Math.round((stats.total / totalCapacity) * 100) : 0;

            // 更新参与率
            document.getElementById('participationRate').textContent = participationRate + '%';

            // 更新满员情况
            const isFull = stats.amCount >= this.maxCapacity || stats.pmCount >= this.maxCapacity;
            const fullStatus = document.getElementById('fullCapacityStatus');

            if (stats.total === 0) {
                fullStatus.textContent = '暂无报名';
                fullStatus.style.color = '#999';
            } else if (isFull) {
                fullStatus.textContent = '已满员';
                fullStatus.style.color = '#dc3545';
            } else if (participationRate >= 80) {
                fullStatus.textContent = '即将满员';
                fullStatus.style.color = '#ff9800';
            } else {
                fullStatus.textContent = '正常报名';
                fullStatus.style.color = '#28a745';
            }

            // 满员提醒
            if (stats.amCount >= this.maxCapacity) {
                console.warn('上午场已满员！');
            }
            if (stats.pmCount >= this.maxCapacity) {
                console.warn('下午场已满员！');
            }
        }
    }

    // Excel导出功能
    class ExcelExporter {
        constructor(dataManager) {
            this.dataManager = dataManager;
        }

        // 导出Excel文件
        exportToExcel(filteredOnly = false) {
            try {
                const data = filteredOnly ? this.dataManager.filteredData : this.dataManager.allData;

                if (data.length === 0) {
                    alert('没有数据可导出');
                    return;
                }

                // 准备Excel数据
                const excelData = data.map((item, index) => ({
                    '序号': item.id,
                    '用户称呼': item.user_name,
                    '时间段': this.getTimeSlotText(item.selected_slot),
                    '提交时间': item.submit_time,
                    'IP地址': item.ip_address || '未知'
                }));

                // 添加统计信息
                const stats = this.dataManager.getStatistics();
                excelData.push({}); // 空行
                excelData.push({ '序号': '统计信息' });
                excelData.push({ '用户称呼': `总报名数：${stats.total}` });
                excelData.push({ '时间段': `上午场：${stats.amCount}人` });
                excelData.push({ '提交时间': `下午场：${stats.pmCount}人` });

                // 创建工作簿
                const ws = XLSX.utils.json_to_sheet(excelData);

                // 设置列宽
                const colWidths = [
                    { wch: 8 },  // 序号
                    { wch: 15 }, // 用户称呼
                    { wch: 20 }, // 时间段
                    { wch: 20 }, // 提交时间
                    { wch: 15 }  // IP地址
                ];
                ws['!cols'] = colWidths;

                // 创建工作簿
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, '报名名单');

                // 生成文件名
                const fileName = `51talk用户访谈会报名名单_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`;

                // 下载文件
                XLSX.writeFile(wb, fileName);

                console.log(`Excel导出成功，共 ${data.length} 条记录`);

            } catch (error) {
                console.error('Excel导出失败:', error);
                alert('导出失败，请检查数据或重试');
            }
        }

        // 获取时间段文本
        getTimeSlotText(slot) {
            return slot === 'AM' ? '上午场 9:30-11:30' : '下午场 14:00-16:00';
        }
    }

    // UI控制器
    class UIController {
        constructor(dataManager, excelExporter, statisticsChart) {
            this.dataManager = dataManager;
            this.excelExporter = excelExporter;
            this.statisticsChart = statisticsChart;
            this.pendingDeleteId = null;
            this.initializeElements();
            this.bindEvents();
        }

        // 初始化DOM元素
        initializeElements() {
            // 统计元素
            this.totalCountEl = document.getElementById('totalCount');
            this.amCountEl = document.getElementById('amCount');
            this.pmCountEl = document.getElementById('pmCount');

            // 筛选元素
            this.searchInput = document.getElementById('searchInput');
            this.searchBtn = document.getElementById('searchBtn');
            this.timeSlotFilter = document.getElementById('timeSlotFilter');
            this.dateFilter = document.getElementById('dateFilter');

            // 操作按钮
            this.refreshBtn = document.getElementById('refreshBtn');
            this.exportBtn = document.getElementById('exportBtn');

            // 表格元素
            this.tableBody = document.getElementById('tableBody');
            this.emptyState = document.getElementById('emptyState');

            // 分页元素
            this.pagination = document.getElementById('pagination');
            this.showingFromEl = document.getElementById('showingFrom');
            this.showingToEl = document.getElementById('showingTo');
            this.totalRecordsEl = document.getElementById('totalRecords');
            this.prevBtn = document.getElementById('prevBtn');
            this.nextBtn = document.getElementById('nextBtn');
            this.pageNumbersEl = document.getElementById('pageNumbers');

            // 弹窗元素
            this.detailModal = document.getElementById('detailModal');
            this.confirmModal = document.getElementById('confirmModal');
            this.deleteModal = document.getElementById('deleteModal');
            this.loadingOverlay = document.getElementById('loadingOverlay');
        }

        // 绑定事件
        bindEvents() {
            // 搜索事件
            this.searchInput.addEventListener('input', debounce(() => this.handleSearch(), 300));
            this.searchBtn.addEventListener('click', () => this.handleSearch());
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });

            // 筛选事件
            this.timeSlotFilter.addEventListener('change', () => this.handleFilter());
            this.dateFilter.addEventListener('change', () => this.handleFilter());

            // 操作按钮事件
            this.refreshBtn.addEventListener('click', () => this.handleRefresh());
            this.exportBtn.addEventListener('click', () => this.handleExport());

            // 分页事件
            this.prevBtn.addEventListener('click', () => this.handlePageChange('prev'));
            this.nextBtn.addEventListener('click', () => this.handlePageChange('next'));

            // 排序事件
            document.querySelectorAll('.sortable').forEach(th => {
                th.addEventListener('click', () => {
                    const field = th.dataset.field;
                    this.handleSort(field);
                });
            });

            // 弹窗事件
            document.getElementById('closeDetailBtn').addEventListener('click', () => this.closeDetailModal());
            document.getElementById('cancelBtn').addEventListener('click', () => this.closeConfirmModal());
            document.getElementById('confirmBtn').addEventListener('click', () => this.confirmExport());

            // 点击弹窗背景关闭
            this.detailModal.addEventListener('click', (e) => {
                if (e.target === this.detailModal) this.closeDetailModal();
            });
            this.confirmModal.addEventListener('click', (e) => {
                if (e.target === this.confirmModal) this.closeConfirmModal();
            });

            // 删除弹窗事件
            document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeDeleteModal());
            document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());
            this.deleteModal.addEventListener('click', (e) => {
                if (e.target === this.deleteModal) this.closeDeleteModal();
            });
        }

        // 搜索处理
        handleSearch() {
            this.dataManager.filters.search = this.searchInput.value.trim();
            this.applyFiltersAndRender();
        }

        // 筛选处理
        handleFilter() {
            this.dataManager.filters.timeSlot = this.timeSlotFilter.value;
            this.dataManager.filters.dateRange = this.dateFilter.value;
            this.applyFiltersAndRender();
        }

        // 排序处理
        handleSort(field) {
            this.dataManager.sortData(field);
            this.updateSortIcons(field);
            this.renderTable();
            this.renderPagination();
        }

        // 更新排序图标
        updateSortIcons(field) {
            document.querySelectorAll('.sort-icon').forEach(icon => {
                icon.textContent = '↕';
            });

            const currentTh = document.querySelector(`[data-field="${field}"] .sort-icon`);
            if (currentTh) {
                currentTh.textContent = this.dataManager.sortDirection === 'asc' ? '↑' : '↓';
            }
        }

        // 刷新数据
        async handleRefresh() {
            try {
                await this.loadData();
                showSuccessMessage('数据刷新成功');
            } catch (error) {
                showErrorMessage('数据刷新失败，请重试');
            }
        }

        // 导出Excel
        handleExport() {
            this.confirmModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        // 确认导出
        confirmExport() {
            this.excelExporter.exportToExcel(this.dataManager.filters.search || this.dataManager.filters.timeSlot || this.dataManager.filters.dateRange);
            this.closeConfirmModal();
            showSuccessMessage('Excel导出成功');
        }

        // 页面切换
        handlePageChange(direction) {
            if (direction === 'prev' && this.dataManager.currentPage > 1) {
                this.dataManager.currentPage--;
            } else if (direction === 'next' && this.dataManager.currentPage < this.getTotalPages()) {
                this.dataManager.currentPage++;
            }
            this.renderTable();
            this.renderPagination();
        }

        // 应用筛选并渲染
        applyFiltersAndRender() {
            this.dataManager.applyFilters();
            this.dataManager.currentPage = 1; // 重置到第一页
            this.renderTable();
            this.renderPagination();
        }

        // 加载数据
        async loadData() {
            const data = await this.dataManager.fetchData();
            this.renderStatistics();
            this.renderTable();
            this.renderPagination();
            return data;
        }

        // 渲染统计信息
        renderStatistics() {
            const stats = this.dataManager.getStatistics();
            this.totalCountEl.textContent = stats.total;
            this.amCountEl.textContent = stats.amCount;
            this.pmCountEl.textContent = stats.pmCount;
        }

        // 渲染表格
        renderTable() {
            const pageData = this.dataManager.getCurrentPageData();

            if (pageData.length === 0) {
                this.tableBody.innerHTML = '';
                this.emptyState.style.display = 'block';
                this.pagination.style.display = 'none';
                return;
            }

            this.emptyState.style.display = 'none';
            this.pagination.style.display = 'flex';

            const tbodyHTML = pageData.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.user_name}</td>
                    <td>
                        <span class="time-slot-badge ${item.selected_slot.toLowerCase()}">
                            ${this.getTimeSlotText(item.selected_slot)}
                        </span>
                    </td>
                    <td>${item.submit_time}</td>
                    <td>
                        <button class="action-btn btn-detail" onclick="uiController.showDetail(${item.id})">
                            查看详情
                        </button>
                        <button class="action-btn btn-delete" onclick="uiController.showDeleteConfirm(${item.id}, '${item.user_name}')">
                            删除
                        </button>
                    </td>
                </tr>
            `).join('');

            this.tableBody.innerHTML = tbodyHTML;
        }

        // 渲染分页
        renderPagination() {
            const totalPages = this.getTotalPages();
            const currentPage = this.dataManager.currentPage;
            const totalRecords = this.dataManager.filteredData.length;
            const start = (currentPage - 1) * this.dataManager.pageSize + 1;
            const end = Math.min(start + this.dataManager.pageSize - 1, totalRecords);

            // 更新分页信息
            this.showingFromEl.textContent = totalRecords > 0 ? start : 0;
            this.showingToEl.textContent = end;
            this.totalRecordsEl.textContent = totalRecords;

            // 更新按钮状态
            this.prevBtn.disabled = currentPage === 1;
            this.nextBtn.disabled = currentPage === totalPages || totalPages === 0;

            // 渲染页码
            this.renderPageNumbers(totalPages, currentPage);
        }

        // 渲染页码
        renderPageNumbers(totalPages, currentPage) {
            let pageNumbersHTML = '';
            const maxVisible = 5;

            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let endPage = Math.min(totalPages, startPage + maxVisible - 1);

            if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbersHTML += `
                    <button class="page-number ${i === currentPage ? 'active' : ''}"
                            onclick="uiController.goToPage(${i})">
                        ${i}
                    </button>
                `;
            }

            this.pageNumbersEl.innerHTML = pageNumbersHTML;
        }

        // 跳转到指定页
        goToPage(page) {
            this.dataManager.currentPage = page;
            this.renderTable();
            this.renderPagination();
        }

        // 显示详情
        showDetail(id) {
            const item = this.dataManager.allData.find(d => d.id === id);
            if (!item) return;

            document.getElementById('detailId').textContent = item.id;
            document.getElementById('detailName').textContent = item.user_name;
            document.getElementById('detailTimeSlot').textContent = this.getTimeSlotText(item.selected_slot);
            document.getElementById('detailSubmitTime').textContent = item.submit_time;
            document.getElementById('detailIP').textContent = item.ip_address || '未知';

            this.detailModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        // 关闭详情弹窗
        closeDetailModal() {
            this.detailModal.style.display = 'none';
            document.body.style.overflow = '';
        }

        // 关闭确认弹窗
        closeConfirmModal() {
            this.confirmModal.style.display = 'none';
            document.body.style.overflow = '';
        }

        // 获取总页数
        getTotalPages() {
            return Math.ceil(this.dataManager.filteredData.length / this.dataManager.pageSize);
        }

        // 获取时间段文本
        getTimeSlotText(slot) {
            return slot === 'AM' ? '上午场 9:30-11:30' : '下午场 14:00-16:00';
        }

        // 显示删除确认弹窗
        showDeleteConfirm(id, userName) {
            this.pendingDeleteId = id;
            document.getElementById('deleteUserName').textContent = userName;
            this.deleteModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        // 关闭删除确认弹窗
        closeDeleteModal() {
            this.deleteModal.style.display = 'none';
            document.body.style.overflow = '';
            this.pendingDeleteId = null;
        }

        // 确认删除
        async confirmDelete() {
            if (!this.pendingDeleteId) return;

            try {
                // 从数据中删除记录
                const index = this.dataManager.allData.findIndex(item => item.id === this.pendingDeleteId);
                if (index !== -1) {
                    const deletedItem = this.dataManager.allData[index];
                    this.dataManager.allData.splice(index, 1);

                    // 重新分配ID
                    this.dataManager.allData.forEach((item, idx) => {
                        item.id = idx + 1;
                    });

                    // 更新本地存储
                    this.updateLocalStorage();

                    // 重新应用筛选和渲染
                    this.applyFiltersAndRender();

                    // 更新统计
                    this.updateStatistics();

                    showSuccessMessage(`已删除用户 "${deletedItem.user_name}" 的报名记录`);

                    console.log('删除成功:', deletedItem);
                }

            } catch (error) {
                console.error('删除失败:', error);
                showErrorMessage('删除失败，请重试');
            } finally {
                this.closeDeleteModal();
            }
        }

        // 更新本地存储
        updateLocalStorage() {
            try {
                // 转换为本地存储格式
                const localStorageData = this.dataManager.allData.map(item => ({
                    user_name: item.user_name,
                    selected_slot: item.selected_slot,
                    submit_time: item.submit_time,
                    ip_address: item.ip_address,
                    timestamp: new Date(item.submit_time).toISOString()
                }));

                localStorage.setItem('registrations', JSON.stringify(localStorageData));
            } catch (error) {
                console.error('更新本地存储失败:', error);
            }
        }

        // 更新统计信息（包括图表）
        updateStatistics() {
            this.renderStatistics();
            this.statisticsChart.updateStatistics();
        }
    }

    // 工具函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    function showSuccessMessage(message) {
        showToast(message, 'success');
    }

    function showErrorMessage(message) {
        showToast(message, 'error');
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        switch (type) {
            case 'success':
                toast.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                break;
            case 'error':
                toast.style.background = 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)';
                break;
            default:
                toast.style.background = 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)';
        }

        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // 初始化应用
    async function initApp() {
        try {
            const dataManager = new DataManager();
            const excelExporter = new ExcelExporter(dataManager);
            const statisticsChart = new StatisticsChart(dataManager);
            window.uiController = new UIController(dataManager, excelExporter, statisticsChart);

            await dataManager.loadMockData();
            uiController.renderStatistics();
            uiController.renderTable();
            uiController.renderPagination();

            // 初始化统计图表
            statisticsChart.updateStatistics();

            console.log('后台管理系统初始化完成');

        } catch (error) {
            console.error('初始化失败:', error);
            showErrorMessage('系统初始化失败，请刷新页面重试');
        }
    }

    // 启动应用
    initApp();

    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        // ESC 关闭弹窗
        if (e.key === 'Escape') {
            const detailModal = document.getElementById('detailModal');
            const confirmModal = document.getElementById('confirmModal');

            if (detailModal.style.display === 'flex') {
                detailModal.style.display = 'none';
                document.body.style.overflow = '';
            }
            if (confirmModal.style.display === 'flex') {
                confirmModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        }

        // Ctrl+F 聚焦搜索框
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
    });
});