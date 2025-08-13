
        // Fill Trend Chart
        const fillTrendCtx = document.getElementById('fillTrendChart').getContext('2d');
        new Chart(fillTrendCtx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                datasets: [{
                    label: 'Nivel Promedio (%)',
                    data: [45, 52, 58, 65, 72, 68, 70],
                    borderColor: '#22d3ee',
                    backgroundColor: 'rgba(34, 211, 238, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Límite Crítico (85%)',
                    data: [85, 85, 85, 85, 85, 85, 85],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: false,
                    borderDash: [5, 5]
                }, {
                    label: 'Límite Advertencia (75%)',
                    data: [75, 75, 75, 75, 75, 75, 75],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: false,
                    borderDash: [3, 3]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            font: {
                                size: 10
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });

        // Weight Distribution Chart
        const weightDistributionCtx = document.getElementById('weightDistributionChart').getContext('2d');
        new Chart(weightDistributionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Seguro (0-50%)', 'Advertencia (51-75%)', 'Crítico (76-100%)', 'Sobrecarga (>100%)'],
                datasets: [{
                    data: [198, 89, 42, 13],
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#ec4899'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 11
                            },
                            padding: 8
                        }
                    }
                }
            }
        });

        // Simulate real-time weight updates
        function updateWeightData() {
            document.querySelectorAll('.weight-value').forEach(element => {
                const currentWeight = parseInt(element.textContent);
                const variation = Math.random() * 6 - 3; // -3 to +3 kg
                const newWeight = Math.max(0, currentWeight + variation);
                element.textContent = Math.round(newWeight);
                
                // Update progress bar and status
                const percentage = (newWeight / 500) * 100;
                const progressBar = element.closest('.weight-card').querySelector('.weight-progress');
                const statusElement = element.closest('.weight-card').querySelector('.weight-status');
                
                progressBar.style.width = Math.min(100, percentage) + '%';
                
                if (percentage > 100) {
                    statusElement.textContent = 'Sobrecarga';
                    statusElement.className = 'weight-status status-overload';
                    progressBar.className = 'weight-progress overload';
                } else if (percentage >= 75) {
                    statusElement.textContent = 'Crítico';
                    statusElement.className = 'weight-status status-critical';
                    progressBar.className = 'weight-progress critical';
                } else if (percentage >= 50) {
                    statusElement.textContent = 'Advertencia';
                    statusElement.className = 'weight-status status-warning';
                    progressBar.className = 'weight-progress warning';
                } else {
                    statusElement.textContent = 'Seguro';
                    statusElement.className = 'weight-status status-safe';
                    progressBar.className = 'weight-progress safe';
                }
                
                // Update capacity percentage
                const capacityElement = element.closest('.weight-card').querySelector('.info-value');
                if (capacityElement && capacityElement.textContent.includes('%')) {
                    capacityElement.textContent = Math.round(percentage) + '%';
                }
            });
        }

        // Update every 30 seconds
        setInterval(updateWeightData, 30000);

        // Weight card clicks
        document.querySelectorAll('.weight-card').forEach(card => {
            card.addEventListener('click', function() {
                const containerId = this.querySelector('.container-id').textContent;
                console.log('Ver detalles de peso para:', containerId);
            });
        });

        // Calibrate sensors button
        document.querySelector('.btn-primary').addEventListener('click', function() {
            console.log('Iniciar calibración de sensores de peso');
        });

        // Export button
        document.querySelector('.btn-secondary').addEventListener('click', function() {
            console.log('Exportar datos de peso');
        });