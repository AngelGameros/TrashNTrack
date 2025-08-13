
        // Temperature Chart (Line Chart)
        const temperatureCtx = document.getElementById('temperatureChart').getContext('2d');
        new Chart(temperatureCtx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                datasets: [{
                    label: 'CONT-001 (Químicos)',
                    data: [2.1, 2.3, 2.0, 2.2, 2.1, 2.0, 2.1],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: false
                }, {
                    label: 'CONT-007 (Sólidos)',
                    data: [3.2, 4.1, 5.8, 6.9, 7.5, 8.0, 8.2],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: false
                }, {
                    label: 'CONT-008 (Líquidos)',
                    data: [1.2, 3.5, 7.8, 11.2, 13.8, 14.9, 15.1],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: false
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
                        beginAtZero: false,
                        ticks: {
                            font: {
                                size: 10
                            },
                            callback: function(value) {
                                return value + '°C';
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

        // Distribution Chart (Doughnut Chart)
        const distributionCtx = document.getElementById('distributionChart').getContext('2d');
        new Chart(distributionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Normal', 'Advertencia', 'Crítico'],
                datasets: [{
                    data: [142, 8, 3],
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
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
                            padding: 10
                        }
                    }
                }
            }
        });

        // Simulate real-time updates
        function updateTemperatures() {
            document.querySelectorAll('.temp-current').forEach(temp => {
                const currentTemp = parseFloat(temp.textContent);
                const variation = (Math.random() - 0.5) * 0.4;
                const newTemp = (currentTemp + variation).toFixed(1);
                temp.textContent = newTemp + '°C';
            });
        }

        // Update temperatures every 30 seconds
        setInterval(updateTemperatures, 30000);

        // Temperature item clicks
        document.querySelectorAll('.temp-item').forEach(item => {
            item.addEventListener('click', function() {
                const containerId = this.querySelector('.temp-container-id').textContent;
                console.log('Ver detalles de temperatura para:', containerId);
            });
        });

        // Filter and update buttons
        document.querySelector('.btn-secondary').addEventListener('click', function() {
            console.log('Aplicar filtros de temperatura');
        });

        document.querySelector('.btn-primary').addEventListener('click', function() {
            console.log('Actualizar datos de temperatura');
            updateTemperatures();
        });
   